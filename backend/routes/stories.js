const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');
const { validateObjectId } = require('../utils/validators');
const {
  createStory,
  getStories,
  getUserStories,
  viewStory,
  deleteStory,
  getStoryViewers,
  cleanupExpiredStories
} = require('../controllers/storyController');

// Story routes
router.post('/', auth, uploadMedia, createStory);
router.get('/', auth, getStories);
router.get('/user/:userId', auth, validateObjectId('userId'), getUserStories);
router.put('/:storyId/view', auth, validateObjectId('storyId'), viewStory);
router.get('/:storyId/viewers', auth, validateObjectId('storyId'), getStoryViewers);
router.delete('/:storyId', auth, validateObjectId('storyId'), deleteStory);

// Admin route for cleanup (can be protected further)
router.delete('/cleanup/expired', cleanupExpiredStories);

module.exports = router;