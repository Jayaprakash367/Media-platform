const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { uploadMedia } = require('../middleware/upload');
const { validateObjectId, validatePost, validateComment, handleValidationErrors } = require('../utils/validators');
const {
  createPost,
  getFeedPosts,
  getUserPosts,
  getPost,
  toggleLike,
  addComment,
  deleteComment,
  deletePost,
  toggleSave,
  getSavedPosts,
  getExplorePosts
} = require('../controllers/postController');

// Post routes
router.post('/', auth, uploadMedia, validatePost, handleValidationErrors, createPost);
router.get('/feed', auth, getFeedPosts);
router.get('/explore', auth, getExplorePosts);
router.get('/saved', auth, getSavedPosts);
router.get('/user/:userId', auth, getUserPosts);
router.get('/:postId', auth, validateObjectId('postId'), getPost);
router.put('/:postId/like', auth, validateObjectId('postId'), toggleLike);
router.put('/:postId/save', auth, validateObjectId('postId'), toggleSave);
router.post('/:postId/comments', auth, validateObjectId('postId'), validateComment, handleValidationErrors, addComment);
router.delete('/:postId/comments/:commentId', auth, validateObjectId('postId'), validateObjectId('commentId'), deleteComment);
router.delete('/:postId', auth, validateObjectId('postId'), deletePost);

module.exports = router;