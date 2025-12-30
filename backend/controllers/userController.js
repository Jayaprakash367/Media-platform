const { Op } = require('sequelize');
const User = require('../models/User');
const Post = require('../models/Post');
const Story = require('../models/Story');
const Follow = require('../models/Follow');
const FollowRequest = require('../models/FollowRequest');
const Notification = require('../models/Notification');
const { uploadMediaToCloudinary, deleteMediaFromCloudinary } = require('../middleware/upload');
const { formatUser, paginate, createPaginationResponse } = require('../utils/helpers');

// Get user profile by username or ID
const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await User.findOne({
      where: { [Op.or]: [{ username }, { id: username }] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const posts = await Post.findAll({
      where: { userId: user.id },
      order: [['createdAt', 'DESC']],
      limit: 12,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture'] }]
    });

    const stories = await Story.getUserStories(user.id);
    const followersCount = await Follow.count({ where: { followingId: user.id } });
    const followingCount = await Follow.count({ where: { followerId: user.id } });
    
    // Check if current user is following this user
    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const followRecord = await Follow.findOne({
        where: { followerId: currentUserId, followingId: user.id }
      });
      isFollowing = !!followRecord;
    }

    const userData = formatUser(user);
    userData.postsCount = await Post.count({ where: { userId: user.id } });
    userData.followersCount = followersCount;
    userData.followingCount = followingCount;
    userData.isFollowing = isFollowing;

    res.json({ success: true, data: { user: userData, posts, stories } });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

// Follow/Unfollow user (with follow request support for private accounts)
const toggleFollow = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (userId === currentUserId) return res.status(400).json({ success: false, message: 'You cannot follow yourself' });

    const target = await User.findByPk(userId);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const existing = await Follow.findOne({ where: { followerId: currentUserId, followingId: userId } });
    if (existing) {
      await existing.destroy();
      // Also delete any pending follow request
      await FollowRequest.destroy({ where: { senderId: currentUserId, receiverId: userId } });
      return res.json({ success: true, message: 'User unfollowed successfully', data: { isFollowing: false, requestStatus: null } });
    }

    // If target account is private, create follow request
    if (target.isPrivate) {
      const existingRequest = await FollowRequest.findOne({
        where: { senderId: currentUserId, receiverId: userId, status: 'pending' }
      });
      
      if (existingRequest) {
        return res.json({ success: true, message: 'Follow request already sent', data: { isFollowing: false, requestStatus: 'pending' } });
      }

      await FollowRequest.create({ senderId: currentUserId, receiverId: userId });
      await Notification.createNotification({
        recipientId: userId,
        senderId: currentUserId,
        type: 'follow_request',
        message: `${req.user.username} wants to follow you`
      });

      return res.json({ success: true, message: 'Follow request sent', data: { isFollowing: false, requestStatus: 'pending' } });
    }

    // Public account - follow immediately
    await Follow.create({ followerId: currentUserId, followingId: userId });
    await Notification.createNotification({
      recipientId: userId,
      senderId: currentUserId,
      type: 'follow',
      message: `${req.user.username} started following you`
    });

    return res.json({ success: true, message: 'User followed successfully', data: { isFollowing: true, requestStatus: null } });
  } catch (error) {
    console.error('Toggle follow error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error following/unfollowing user'
    });
  }
};

// Get followers
const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const followers = await Follow.findAndCountAll({
      where: { followingId: userId },
      include: [{ model: User, as: 'follower', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] }],
      offset: skip,
      limit: limitNum
    });

    // Get following status for each follower
    const followerIds = followers.rows.map(f => f.follower?.id).filter(Boolean);
    const followingRecords = await Follow.findAll({
      where: {
        followerId: currentUserId,
        followingId: followerIds
      }
    });
    
    const followingIds = new Set(followingRecords.map(f => f.followingId));

    const data = followers.rows.map((f) => {
      const follower = f.follower;
      const plain = follower?.toJSON?.() || follower;
      if (plain && currentUserId) {
        plain.isFollowing = followingIds.has(plain.id);
      }
      return plain;
    });

    const response = createPaginationResponse(data, followers.count, parseInt(page), parseInt(limit));
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching followers'
    });
  }
};

// Get following
const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user?.id;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const following = await Follow.findAndCountAll({
      where: { followerId: userId },
      include: [{ model: User, as: 'followingUser', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] }],
      offset: skip,
      limit: limitNum
    });

    // Get following status for each user
    const followingUserIds = following.rows.map(f => f.followingUser?.id).filter(Boolean);
    const currentUserFollowing = await Follow.findAll({
      where: {
        followerId: currentUserId,
        followingId: followingUserIds
      }
    });
    
    const followingIds = new Set(currentUserFollowing.map(f => f.followingId));

    const data = following.rows.map((f) => {
      const user = f.followingUser?.toJSON?.() || f.followingUser;
      if (user && currentUserId) {
        user.isFollowing = followingIds.has(user.id);
      }
      return user;
    });
    const response = createPaginationResponse(data, following.count, parseInt(page), parseInt(limit));
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching following'
    });
  }
};

// Get user suggestions
const getUserSuggestions = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const following = await Follow.findAll({ where: { followerId: currentUserId } });
    const excludeIds = following.map((f) => f.followingId);
    excludeIds.push(currentUserId);

    const suggestions = await User.findAll({
      where: { id: { [Op.notIn]: excludeIds } },
      attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'],
      order: [['createdAt', 'DESC']],
      limit
    });

    res.json({ success: true, data: { suggestions } });
  } catch (error) {
    console.error('Get user suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user suggestions'
    });
  }
};

// Search users - returns all users if no query provided
const searchUsers = async (req, res) => {
  try {
    const { q: query, page = 1, limit = 50 } = req.query;
    const currentUserId = req.user.id;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    // Build where clause - if query exists, search, otherwise get all users
    const whereClause = { id: { [Op.ne]: currentUserId } };
    
    if (query && query.trim().length >= 2) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${query}%` } },
        { fullName: { [Op.like]: `%${query}%` } }
      ];
    }

    const { rows: users, count } = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified', 'bio'],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: skip
    });

    // Get following status for each user
    const followingRecords = await Follow.findAll({
      where: {
        followerId: currentUserId,
        followingId: users.map(u => u.id)
      }
    });
    
    const followingIds = new Set(followingRecords.map(f => f.followingId));

    // Add isFollowing field to each user
    const usersWithFollowStatus = users.map(user => {
      const userObj = user.toJSON();
      userObj.isFollowing = followingIds.has(user.id);
      return userObj;
    });

    const response = createPaginationResponse(usersWithFollowStatus, count, parseInt(page), parseInt(limit));
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching users'
    });
  }
};

// Get received follow requests
const getFollowRequests = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const requests = await FollowRequest.findAndCountAll({
      where: { receiverId: currentUserId, status: 'pending' },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified']
      }],
      order: [['createdAt', 'DESC']],
      offset: skip,
      limit: limitNum
    });

    const response = createPaginationResponse(requests.rows, requests.count, parseInt(page), parseInt(limit));
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get follow requests error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching follow requests' });
  }
};

// Accept follow request
const acceptFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const request = await FollowRequest.findOne({
      where: { id: requestId, receiverId: currentUserId, status: 'pending' }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Follow request not found' });
    }

    // Create follow relationship
    await Follow.create({
      followerId: request.senderId,
      followingId: request.receiverId
    });

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Create notification
    await Notification.createNotification({
      recipientId: request.senderId,
      senderId: currentUserId,
      type: 'follow_accepted',
      message: `${req.user.username} accepted your follow request`
    });

    res.json({ success: true, message: 'Follow request accepted' });
  } catch (error) {
    console.error('Accept follow request error:', error);
    res.status(500).json({ success: false, message: 'Server error accepting follow request' });
  }
};

// Reject follow request
const rejectFollowRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user.id;

    const request = await FollowRequest.findOne({
      where: { id: requestId, receiverId: currentUserId, status: 'pending' }
    });

    if (!request) {
      return res.status(404).json({ success: false, message: 'Follow request not found' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({ success: true, message: 'Follow request rejected' });
  } catch (error) {
    console.error('Reject follow request error:', error);
    res.status(500).json({ success: false, message: 'Server error rejecting follow request' });
  }
};

// Add user to close friends
const addCloseFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findByPk(currentUserId);
    const closeFriends = user.closeFriends || [];
    
    if (!closeFriends.includes(userId)) {
      closeFriends.push(userId);
      user.closeFriends = closeFriends;
      await user.save();
    }

    res.json({ success: true, message: 'User added to close friends' });
  } catch (error) {
    console.error('Add close friend error:', error);
    res.status(500).json({ success: false, message: 'Server error adding close friend' });
  }
};

// Remove user from close friends
const removeCloseFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const user = await User.findByPk(currentUserId);
    const closeFriends = user.closeFriends || [];
    
    user.closeFriends = closeFriends.filter(id => id !== userId);
    await user.save();

    res.json({ success: true, message: 'User removed from close friends' });
  } catch (error) {
    console.error('Remove close friend error:', error);
    res.status(500).json({ success: false, message: 'Server error removing close friend' });
  }
};

// Update profile picture
const updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const currentUserId = req.user.id;
    const user = await User.findByPk(currentUserId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadMediaToCloudinary(req.file);

    // Delete old profile picture from Cloudinary if it exists
    if (user.profilePicturePublicId) {
      try {
        await deleteMediaFromCloudinary(user.profilePicturePublicId, 'image');
      } catch (deleteError) {
        console.warn('Error deleting old profile picture:', deleteError.message);
      }
    }

    // Update user with new profile picture
    user.profilePicture = uploadResult.url;
    user.profilePicturePublicId = uploadResult.publicId;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: user.profilePicture,
        publicId: user.profilePicturePublicId
      }
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload profile picture. Please check your Cloudinary configuration.' 
    });
  }
};

module.exports = {
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
};