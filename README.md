# Instagram Clone - Full Stack Application

A complete Instagram clone built with modern web technologies, featuring real-time chat, stories, posts, and a beautiful dark-mode-first design.

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Axios** - HTTP client for API calls
- **Socket.io Client** - Real-time communication
- **Heroicons** - Beautiful SVG icons
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.io** - Real-time WebSocket server
- **JWT** - Authentication tokens
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Cloudinary** - Cloud media storage
- **Multer** - File upload handling

## 📱 Features

### ✅ Core Features
- **User Authentication**
  - User registration and login
  - JWT-based authentication
  - Profile management
  - Follow/unfollow users

- **Posts System**
  - Upload image and video posts
  - Like/unlike posts with animations
  - Comments with real-time updates
  - Save/unsave posts
  - Hashtag and mention support

- **Stories**
  - Upload image/video stories
  - 24-hour auto-expiration
  - Story viewer with progress bars
  - View tracking and analytics

- **Real-time Chat**
  - One-to-one messaging
  - Online/offline status
  - Message seen indicators
  - Typing indicators

- **Notifications**
  - Like notifications
  - Comment notifications
  - Follow notifications
  - Real-time updates

### 🎨 UI/UX Features
- **Dark Mode** - Beautiful dark-first design
- **Responsive** - Mobile and desktop optimized
- **Animations** - Smooth micro-interactions
- **Instagram-style Gradients** - Pink, purple, orange
- **Skeleton Loaders** - Better loading states
- **Infinite Scroll** - Seamless content loading

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account (for media storage)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/instagram-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

## 📁 Project Structure

```
instagram-clone/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Next.js pages
│   │   ├── lib/         # Utility functions
│   │   └── hooks/       # Custom hooks
│   └── public/          # Static assets
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Users
- `GET /api/users/:username` - Get user profile
- `PUT /api/users/:userId/follow` - Follow/unfollow user
- `GET /api/users/:userId/followers` - Get followers
- `GET /api/users/:userId/following` - Get following

### Posts
- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed posts
- `GET /api/posts/explore` - Get explore posts
- `PUT /api/posts/:postId/like` - Like/unlike post
- `POST /api/posts/:postId/comments` - Add comment

### Stories
- `POST /api/stories` - Create story
- `GET /api/stories` - Get stories
- `PUT /api/stories/:storyId/view` - View story

### Chat
- `GET /api/chat` - Get user chats
- `POST /api/chat/:chatId/messages` - Send message
- `GET /api/chat/:chatId/messages` - Get messages

## 🎯 Key Features Implementation

### Real-time Features
- Socket.io integration for live updates
- Real-time notifications
- Live messaging with typing indicators
- Online/offline status tracking

### Media Handling
- Cloudinary integration for image/video storage
- Automatic image optimization
- Support for multiple media formats
- File size and type validation

### Security
- JWT authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting for API endpoints
- Protected routes

### Performance
- Infinite scroll for feeds
- Image lazy loading
- Optimized database queries
- Pagination for large datasets
- Caching strategies

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Render/Railway)
1. Connect your GitHub repository
2. Set environment variables
3. Choose your instance type
4. Deploy

### Database (MongoDB Atlas)
1. Create a free MongoDB Atlas cluster
2. Configure network access
3. Get connection string
4. Update environment variables

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is for educational purposes only. Not intended for commercial use.

## 🙏 Acknowledgments

- Instagram for the design inspiration
- All the open-source libraries used
- The developer community for tutorials and resources

---
Run the server:
 npm run dev
 > instagram-clone@1.0.0 dev
 > concurrently "npm run backend" "npm run frontend"

**Built with ❤️ using modern web technologies**