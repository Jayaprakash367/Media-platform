const { Op } = require('sequelize');
const Story = require('../models/Story');
const User = require('../models/User');
const Follow = require('../models/Follow');

// Create a new story
const createStory = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Media file is required' });
    }

    const { uploadMediaToCloudinary } = require('../middleware/upload');
    const mediaUpload = await uploadMediaToCloudinary(req.file);

    const story = await Story.create({
      userId,
      mediaUrl: mediaUpload.url,
      mediaType: mediaUpload.mediaType
    });

    const user = await User.findByPk(userId, { attributes: ['id', 'username', 'fullName', 'profilePicture'] });
    story.dataValues.user = user;

    res.status(201).json({ success: true, message: 'Story created successfully', data: { story } });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ success: false, message: 'Server error creating story' });
  }
};

// Get active stories (from followed users and self)
const getStories = async (req, res) => {
  try {
    const userId = req.user.id;

    const follows = await Follow.findAll({ where: { followerId: userId } });
    const followingIds = follows.map((f) => f.followingId);
    followingIds.push(userId);

    const stories = await Story.getActiveStories(followingIds);
    res.json({ success: true, data: { stories } });
  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching stories' });
  }
};

// Get a specific user's stories
const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const stories = await Story.getUserStories(userId);
    res.json({ success: true, data: { stories } });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user stories' });
  }
};

// View a story (placeholder since viewers are not tracked yet)
const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findByPk(storyId);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    const isNewView = typeof story.markAsViewed === 'function' ? story.markAsViewed(req.user.id) : false;
    if (typeof story.save === 'function') await story.save();

    res.json({ success: true, message: 'Story viewed', data: { story, isNewView } });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ success: false, message: 'Server error viewing story' });
  }
};

// Get story viewers (placeholder, returns empty until viewer tracking is added)
const getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;
    const story = await Story.findByPk(storyId);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

    res.json({ success: true, data: { viewers: [], count: 0 } });
  } catch (error) {
    console.error('Get story viewers error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching viewers' });
  }
};

// Delete a story
const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;

    const story = await Story.findByPk(storyId);
    if (!story) return res.status(404).json({ success: false, message: 'Story not found' });
    if (story.userId !== userId) return res.status(403).json({ success: false, message: 'Not authorized to delete this story' });

    await Story.destroy({ where: { id: storyId } });
    res.json({ success: true, message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ success: false, message: 'Server error deleting story' });
  }
};

// Remove expired stories
const cleanupExpiredStories = async (req, res) => {
  try {
    const deleted = await Story.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
    res.json({ success: true, message: 'Expired stories cleaned', data: { deleted } });
  } catch (error) {
    console.error('Cleanup expired stories error:', error);
    res.status(500).json({ success: false, message: 'Server error cleaning expired stories' });
  }
};

module.exports = {
  createStory,
  getStories,
  getUserStories,
  viewStory,
  getStoryViewers,
  deleteStory,
  cleanupExpiredStories
};