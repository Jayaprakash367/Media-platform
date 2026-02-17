const express = require('express');
const sequelize = require('./config/database');
const models = require('./models'); // Import all models with associations
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-url.com' 
      : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-url.com' 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Database connection
sequelize.authenticate()
  .then(() => {
    console.log('✅ Connected to SQLite');
    return sequelize.sync({ alter: true });
  })
  .then(() => console.log('✅ Database tables synchronized'))
  .catch(err => {
    console.error('❌ Database connection error:', err.message);
    console.log('\n⚠️  To use the full app, you need PostgreSQL running.');
    console.log('   Update your .env file with correct DB credentials:\n');
    console.log('   DB_HOST=localhost');
    console.log('   DB_PORT=5432');
    console.log('   DB_NAME=instagram_clone');
    console.log('   DB_USER=postgres');
    console.log('   DB_PASSWORD=your_password\n');
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/stories', require('./routes/stories'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/support', require('./routes/support'));

// Socket.IO for real-time features
const activeUsers = new Map();
const userChats = new Map(); // Track which chats each user is in

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // User comes online
  socket.on('user-online', (userId) => {
    activeUsers.set(userId, socket.id);
    io.emit('user-status-update', { userId, status: 'online' });
    console.log('User online:', userId);
  });

  // User joins a chat room
  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    if (!userChats.has(socket.id)) {
      userChats.set(socket.id, new Set());
    }
    userChats.get(socket.id).add(chatId);
    io.to(chatId).emit('user-joined-chat', { chatId });
  });

  // User leaves a chat room
  socket.on('leave-chat', (chatId) => {
    socket.leave(chatId);
    if (userChats.has(socket.id)) {
      userChats.get(socket.id).delete(chatId);
    }
  });

  // Handle new message in real-time
  socket.on('send-message', (messageData) => {
    // Emit to all users in the chat room
    io.to(messageData.chatId).emit('receive-message', {
      ...messageData,
      timestamp: new Date()
    });
    
    // Emit unread badge update to recipient if they're not in the chat
    const recipientId = messageData.recipientId;
    if (recipientId && activeUsers.has(recipientId)) {
      const recipientSocketId = activeUsers.get(recipientId);
      io.to(recipientSocketId).emit('unread-count-updated', {
        chatId: messageData.chatId,
        unreadCount: 1
      });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user-typing', {
      userId: data.userId,
      username: data.username,
      chatId: data.chatId
    });
  });

  // Handle stop typing
  socket.on('stop-typing', (data) => {
    socket.to(data.chatId).emit('user-stop-typing', {
      userId: data.userId,
      chatId: data.chatId
    });
  });

  // Handle message seen/read
  socket.on('message-read', (data) => {
    io.to(data.chatId).emit('messages-read', {
      chatId: data.chatId,
      readBy: data.userId
    });
  });

  // User comes offline
  socket.on('disconnect', () => {
    // Find and remove user from active users
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit('user-status-update', { userId, status: 'offline' });
        console.log('User offline:', userId);
        break;
      }
    }
    // Clean up user chats
    if (userChats.has(socket.id)) {
      userChats.delete(socket.id);
    }
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);
app.set('activeUsers', activeUsers);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});