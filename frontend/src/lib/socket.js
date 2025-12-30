import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event listeners
export const socketEvents = {
  onUserOnline: (callback) => {
    const socket = getSocket();
    socket.on('user-status-update', callback);
  },

  onNewNotification: (callback) => {
    const socket = getSocket();
    socket.on('new-notification', callback);
  },

  onNewMessage: (callback) => {
    const socket = getSocket();
    socket.on('new-message', callback);
  },

  onUserTyping: (callback) => {
    const socket = getSocket();
    socket.on('user-typing', callback);
  },

  // Emit events
  emitUserOnline: (userId) => {
    const socket = getSocket();
    socket.emit('user-online', userId);
  },

  joinChat: (chatId) => {
    const socket = getSocket();
    socket.emit('join-chat', chatId);
  },

  sendMessage: (messageData) => {
    const socket = getSocket();
    socket.emit('send-message', messageData);
  },

  emitTyping: (data) => {
    const socket = getSocket();
    socket.emit('typing', data);
  },
};

export default socket;