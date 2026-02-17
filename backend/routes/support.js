const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  reportProblem,
  getHelpTopics,
  getPrivacyPolicy
} = require('../controllers/supportController');

// Public routes
router.get('/help', getHelpTopics);
router.get('/privacy', getPrivacyPolicy);

// Protected routes
router.post('/report', auth, reportProblem);

module.exports = router;
