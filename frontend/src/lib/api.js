import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  updateProfileWithImage: (formData) => api.put('/auth/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  searchUsers: (query) => api.get(`/auth/search?q=${query}`),
  getNotifications: (page = 1, limit = 20) => 
    api.get(`/auth/notifications?page=${page}&limit=${limit}`),
  markNotificationsAsRead: (notificationIds) => 
    api.put('/auth/notifications/read', { notificationIds }),
  logout: () => api.post('/auth/logout'),
};

// User APIs
export const userAPI = {
  getProfile: (username) => api.get(`/users/${username}`),
  getUserProfile: (username) => api.get(`/users/${username}`),
  toggleFollow: (userId) => api.put(`/users/${userId}/follow`),
  followUser: (userId) => api.put(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.put(`/users/${userId}/follow`),
  getFollowers: (userId, page = 1, limit = 20) => 
    api.get(`/users/${userId}/followers?page=${page}&limit=${limit}`),
  getFollowing: (userId, page = 1, limit = 20) => 
    api.get(`/users/${userId}/following?page=${page}&limit=${limit}`),
  getUserSuggestions: (limit = 10) => 
    api.get(`/users/suggestions?limit=${limit}`),
  getSuggestions: (limit = 10) => 
    api.get(`/users/suggestions?limit=${limit}`),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  uploadProfilePicture: (formData) => api.post('/users/profile-picture/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Post APIs
export const postAPI = {
  createPost: (formData) => api.post('/posts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getFeedPosts: (page = 1, limit = 20) => 
    api.get(`/posts/feed?page=${page}&limit=${limit}`),
  getUserPosts: (userId, page = 1, limit = 20) => 
    api.get(`/posts/user/${userId}?page=${page}&limit=${limit}`),
  getPost: (postId) => api.get(`/posts/${postId}`),
  toggleLike: (postId) => api.put(`/posts/${postId}/like`),
  addComment: (postId, text) => api.post(`/posts/${postId}/comments`, { text }),
  deleteComment: (postId, commentId) => 
    api.delete(`/posts/${postId}/comments/${commentId}`),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  toggleSave: (postId) => api.put(`/posts/${postId}/save`),
  getSavedPosts: (page = 1, limit = 20) => 
    api.get(`/posts/saved?page=${page}&limit=${limit}`),
  getExplorePosts: (page = 1, limit = 20) => 
    api.get(`/posts/explore?page=${page}&limit=${limit}`),
};

// Story APIs
export const storyAPI = {
  createStory: (formData) => api.post('/stories', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getStories: () => api.get('/stories'),
  getUserStories: (userId) => api.get(`/stories/user/${userId}`),
  viewStory: (storyId) => api.put(`/stories/${storyId}/view`),
  deleteStory: (storyId) => api.delete(`/stories/${storyId}`),
  getStoryViewers: (storyId) => api.get(`/stories/${storyId}/viewers`),
};

// Chat APIs
export const chatAPI = {
  getChats: (page = 1, limit = 20) => 
    api.get(`/chat?page=${page}&limit=${limit}`),
  getOrCreateChat: (userId) => api.get(`/chat/user/${userId}`),
  getMessages: (chatId, page = 1, limit = 50) => 
    api.get(`/chat/${chatId}/messages?page=${page}&limit=${limit}`),
  sendMessage: (chatId, messageData) => 
    api.post(`/chat/${chatId}/messages`, messageData),
  markMessagesAsRead: (chatId) => api.put(`/chat/${chatId}/read`),
  deleteMessage: (chatId, messageId) => 
    api.delete(`/chat/${chatId}/messages/${messageId}`),
  archiveChat: (chatId) => api.put(`/chat/${chatId}/archive`),
  getUnreadCount: () => api.get('/chat/unread-count'),
};

export default api;