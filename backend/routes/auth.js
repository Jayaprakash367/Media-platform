const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, validateProfileUpdate, handleValidationErrors } = require('../utils/validators');
const {
  register,
  login,
  getProfile,
  updateProfile,
  searchUsers,
  getNotifications,
  markNotificationsAsRead,
  verifyOTP,
  resendOTP,
  logout
} = require('../controllers/authController');

// Public routes
router.post('/register', validateUserRegistration, handleValidationErrors, register);
router.post('/login', validateUserLogin, handleValidationErrors, login);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Protected routes
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.get('/search', auth, searchUsers);
router.get('/notifications', auth, getNotifications);
router.put('/notifications/read', auth, markNotificationsAsRead);
router.post('/logout', auth, logout);

module.exports = router;