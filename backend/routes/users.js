const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadProfilePicture } = require('../middleware/upload');
const { validateObjectId } = require('../utils/validators');
const {
  getUserProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserSuggestions,
  searchUsers,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  addCloseFriend,
  removeCloseFriend,
  updateProfilePicture
} = require('../controllers/userController');

// User suggestions (must come before :username route)
router.get('/suggestions', auth, getUserSuggestions);

// User search
router.get('/search', auth, searchUsers);

// Follow requests
router.get('/follow-requests', auth, getFollowRequests);
router.put('/follow-requests/:requestId/accept', auth, acceptFollowRequest);
router.put('/follow-requests/:requestId/reject', auth, rejectFollowRequest);

// Close friends
router.put('/:userId/close-friends/add', auth, validateObjectId('userId'), addCloseFriend);
router.put('/:userId/close-friends/remove', auth, validateObjectId('userId'), removeCloseFriend);

// Profile picture upload
router.post('/profile-picture/upload', auth, uploadProfilePicture, updateProfilePicture);

// User profile routes
router.get('/:username', auth, getUserProfile);
router.put('/:userId/follow', auth, validateObjectId('userId'), toggleFollow);
router.get('/:userId/followers', auth, validateObjectId('userId'), getFollowers);
router.get('/:userId/following', auth, validateObjectId('userId'), getFollowing);

module.exports = router;