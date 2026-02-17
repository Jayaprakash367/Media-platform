const User = require('../models/User');

// Report a problem
const reportProblem = async (req, res) => {
  try {
    const { category, description, screenshots } = req.body;
    const userId = req.user.id;

    if (!category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Category and description are required'
      });
    }

    // In production, you'd save this to a support tickets table
    console.log(`Support ticket from user ${userId}:`, { category, description, screenshots });

    res.json({
      success: true,
      message: 'Your report has been submitted. We will review it shortly.',
      data: {
        ticketId: `TICKET-${Date.now()}`,
        status: 'submitted'
      }
    });
  } catch (error) {
    console.error('Report problem error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error submitting report'
    });
  }
};

// Get help topics
const getHelpTopics = async (req, res) => {
  try {
    const topics = [
      {
        id: 1,
        title: 'Account & Login',
        description: 'Issues with logging in, creating an account, or managing your profile',
        articles: [
          { id: 1, title: 'How to reset your password', content: 'Go to login page and click "Forgot Password"' },
          { id: 2, title: 'How to change your username', content: 'Go to Settings > Edit Profile > Username' },
          { id: 3, title: 'How to make your account private', content: 'Go to Settings > Privacy > Private Account' }
        ]
      },
      {
        id: 2,
        title: 'Posts & Stories',
        description: 'Help with creating, editing, and managing posts and stories',
        articles: [
          { id: 4, title: 'How to create a post', content: 'Click the + button in the navigation bar' },
          { id: 5, title: 'How to add a story', content: 'Click the + icon on your profile picture in the stories bar' },
          { id: 6, title: 'How to delete a post', content: 'Open the post, click the three dots, and select Delete' }
        ]
      },
      {
        id: 3,
        title: 'Messages & Chat',
        description: 'Help with sending messages and managing conversations',
        articles: [
          { id: 7, title: 'How to send a message', content: 'Go to Messages and select a user to start chatting' },
          { id: 8, title: 'How to delete a message', content: 'Long press on the message and select Delete' }
        ]
      },
      {
        id: 4,
        title: 'Privacy & Security',
        description: 'Manage your privacy settings and account security',
        articles: [
          { id: 9, title: 'How to block a user', content: 'Go to their profile, click the three dots, and select Block' },
          { id: 10, title: 'How to report content', content: 'Click the three dots on any post and select Report' }
        ]
      }
    ];

    res.json({
      success: true,
      data: { topics }
    });
  } catch (error) {
    console.error('Get help topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching help topics'
    });
  }
};

// Get privacy policy
const getPrivacyPolicy = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        title: 'Privacy Policy',
        lastUpdated: '2026-01-01',
        content: 'This privacy policy explains how we collect, use, and protect your personal information when you use our social media platform.'
      }
    });
  } catch (error) {
    console.error('Get privacy policy error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching privacy policy'
    });
  }
};

module.exports = {
  reportProblem,
  getHelpTopics,
  getPrivacyPolicy
};
