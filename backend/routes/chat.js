const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { validateObjectId, validateMessage, handleValidationErrors } = require('../utils/validators');
const {
  getChats,
  getOrCreateChat,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
  archiveChat,
  getUnreadCount
} = require('../controllers/chatController');

// Chat routes
router.get('/unread-count', auth, getUnreadCount);
router.get('/', auth, getChats);
router.get('/user/:userId', auth, validateObjectId('userId'), getOrCreateChat);
router.get('/:chatId/messages', auth, validateObjectId('chatId'), getMessages);
router.post('/:chatId/messages', auth, validateObjectId('chatId'), validateMessage, handleValidationErrors, sendMessage);
router.put('/:chatId/read', auth, validateObjectId('chatId'), markMessagesAsRead);
router.delete('/:chatId/messages/:messageId', auth, validateObjectId('chatId'), validateObjectId('messageId'), deleteMessage);
router.put('/:chatId/archive', auth, validateObjectId('chatId'), archiveChat);

module.exports = router;