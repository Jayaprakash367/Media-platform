const { Op } = require('sequelize');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const Save = require('../models/Save');
const Notification = require('../models/Notification');
const { formatPost, paginate, createPaginationResponse, extractHashtags, extractMentions } = require('../utils/helpers');
const Follow = require('../models/Follow');

// Create a new post
const createPost = async (req, res) => {
  try {
    const { caption, location, mediaType, visibility = 'public', isReel = false } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Media file is required' });
    }

    const { uploadMediaToCloudinary } = require('../middleware/upload');
    const mediaUpload = await uploadMediaToCloudinary(req.file);

    // Mentions (optional)
    const mentions = extractMentions(caption || '');
    let mentionedUsers = [];
    if (mentions.length) {
      mentionedUsers = await User.findAll({ where: { username: mentions } });
    }

    const post = await Post.create({
      userId,
      mediaUrl: mediaUpload.url,
      mediaType: mediaUpload.mediaType || mediaType || 'image',
      caption: caption || '',
      location: location || '',
      visibility: visibility || 'public',
      isReel: isReel || false
    });

    const postWithUser = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture'] }]
    });

    // Mention notifications (best-effort)
    if (mentionedUsers.length > 0) {
      await Promise.all(mentionedUsers.map((u) => Notification.createNotification({
        recipientId: u.id,
        senderId: userId,
        type: 'mention',
        relatedPostId: post.id,
        message: `${req.user.username} mentioned you in a post`
      })));
    }

    res.status(201).json({
      success: true,
      message: `${isReel ? 'Reel' : 'Post'} created successfully`,
      data: { post: formatPost(postWithUser, userId) }
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ success: false, message: 'Server error creating post' });
  }
};

// Get feed posts (respecting visibility and close friends)
const getFeedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    // Get current user's close friends list and following
    const currentUser = await User.findByPk(userId, { attributes: ['closeFriends'] });
    const closeFriends = currentUser?.closeFriends || [];

    // following ids
    const follows = await Follow.findAll({ where: { followerId: userId } });
    const followingIds = follows.map((f) => f.followingId);
    followingIds.push(userId);

    // Build visibility filter:
    // - Show all public posts from followed users AND all public posts from anyone (discover)
    // - Show close_friends posts only if current user is in the author's close friends list
    // - Always show own posts regardless of visibility
    const visibilityConditions = [
      // All public posts (from anyone)
      { visibility: 'public' },
      // Own posts always visible
      { userId: userId }
    ];

    // Only add close_friends filter if the user actually has close friends
    if (closeFriends.length > 0) {
      visibilityConditions.push({ visibility: 'close_friends', userId: closeFriends });
    }

    const whereClause = {
      [Op.or]: visibilityConditions
    };

    const { rows, count } = await Post.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] },
        { model: Like, as: 'likes', attributes: ['userId'] },
        { model: Comment, as: 'comments', attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: skip
    });

    // Get follower counts for each post author
    const authorIds = [...new Set(rows.map(p => p.userId))];
    const followerCounts = await Promise.all(
      authorIds.map(async (authorId) => ({
        userId: authorId,
        count: await Follow.count({ where: { followingId: authorId } })
      }))
    );
    const followerCountMap = Object.fromEntries(followerCounts.map(f => [f.userId, f.count]));

    // Get following status for each author
    const followingRecords = await Follow.findAll({
      where: {
        followerId: userId,
        followingId: authorIds
      }
    });
    const followingSet = new Set(followingRecords.map(f => f.followingId));

    const formattedPosts = rows.map((p) => {
      const formatted = formatPost(p, userId);
      if (formatted.user) {
        formatted.user.followersCount = followerCountMap[formatted.user.id] || 0;
        formatted.user.isFollowing = followingSet.has(formatted.user.id);
      }
      return formatted;
    });
    const response = createPaginationResponse(formattedPosts, count, parseInt(page), parseInt(limit));

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching feed posts'
    });
  }
};

// Get posts by user
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    // Find user by username or ID
    const user = await User.findOne({
      where: { [Op.or]: [{ username: userId }, { id: userId }] }
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const { rows, count } = await Post.findAndCountAll({
      where: { userId: user.id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] },
        { model: Like, as: 'likes', attributes: ['userId'] },
        { model: Comment, as: 'comments', attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: skip
    });

    // Get follower count and following status
    const followersCount = await Follow.count({ where: { followingId: user.id } });
    const isFollowing = currentUserId !== user.id ? 
      !!(await Follow.findOne({ where: { followerId: currentUserId, followingId: user.id } })) : 
      false;

    const formattedPosts = rows.map((p) => {
      const formatted = formatPost(p, currentUserId);
      if (formatted.user) {
        formatted.user.followersCount = followersCount;
        formatted.user.isFollowing = isFollowing;
      }
      return formatted;
    });
    const response = createPaginationResponse(formattedPosts, count, parseInt(page), parseInt(limit));

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user posts'
    });
  }
};

// Get single post
const getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user.id;

    const post = await Post.findByPk(postId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] },
        { model: Like, as: 'likes', attributes: ['userId'] },
        { model: Comment, as: 'comments', attributes: ['id', 'userId', 'text', 'createdAt'] }
      ]
    });

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Get follower count and following status for post author
    const followersCount = await Follow.count({ where: { followingId: post.userId } });
    const isFollowing = currentUserId !== post.userId ? 
      !!(await Follow.findOne({ where: { followerId: currentUserId, followingId: post.userId } })) : 
      false;

    const formatted = formatPost(post, currentUserId);
    if (formatted.user) {
      formatted.user.followersCount = followersCount;
      formatted.user.isFollowing = isFollowing;
    }

    res.json({ success: true, data: { post: formatted } });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching post'
    });
  }
};

// Like/Unlike post
const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId, { include: [{ model: Like, as: 'likes' }] });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const existing = await Like.findOne({ where: { postId, userId } });
    let isLiked;
    if (existing) {
      await existing.destroy();
      post.likesCount = Math.max((post.likesCount || 1) - 1, 0);
      isLiked = false;
    } else {
      await Like.create({ postId, userId });
      post.likesCount = (post.likesCount || 0) + 1;
      isLiked = true;

      if (post.userId !== userId) {
        await Notification.createNotification({
          recipientId: post.userId,
          senderId: userId,
          type: 'like',
          relatedPostId: post.id,
          message: `${req.user.username} liked your post`
        });
      }
    }
    await post.save();

    res.json({ success: true, message: isLiked ? 'Post liked' : 'Post unliked', data: { isLiked, likesCount: post.likesCount } });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling like'
    });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) return res.status(400).json({ success: false, message: 'Comment text is required' });

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({ postId, userId, text: text.trim() });
    post.commentsCount = (post.commentsCount || 0) + 1;
    await post.save();

    if (post.userId !== userId) {
      await Notification.createNotification({
        recipientId: post.userId,
        senderId: userId,
        type: 'comment',
        relatedPostId: post.id,
        message: `${req.user.username} commented on your post`
      });
    }

    res.status(201).json({ success: true, message: 'Comment added successfully', data: { comment } });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
};

// Delete comment
const deleteComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.findByPk(commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.userId !== userId && post.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await comment.destroy();
    post.commentsCount = Math.max((post.commentsCount || 1) - 1, 0);
    await post.save();

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting comment'
    });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.userId !== userId) return res.status(403).json({ success: false, message: 'Not authorized to delete this post' });

    await Like.destroy({ where: { postId } });
    await Comment.destroy({ where: { postId } });
    await Save.destroy({ where: { postId } });
    await Post.destroy({ where: { id: postId } });

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting post'
    });
  }
};

// Save/Unsave post
const toggleSave = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const existing = await Save.findOne({ where: { postId, userId } });
    let isSaved;
    if (existing) {
      await existing.destroy();
      isSaved = false;
    } else {
      await Save.create({ postId, userId });
      isSaved = true;
    }

    res.json({ success: true, message: isSaved ? 'Post saved' : 'Post unsaved', data: { isSaved } });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling save'
    });
  }
};

// Get saved posts
const getSavedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const { rows, count } = await Save.findAndCountAll({
      where: { userId },
      include: [{ model: Post, as: 'post', include: [{ model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture'] }] }],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: skip
    });

    const posts = rows.map((s) => formatPost(s.post, userId));
    const response = createPaginationResponse(posts, count, parseInt(page), parseInt(limit));

    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get saved posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching saved posts'
    });
  }
};

// Get explore/trending posts
const getExplorePosts = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const currentUserId = req.user.id;

    const posts = await Post.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] },
        { model: Like, as: 'likes', attributes: ['userId'] }
      ],
      order: [['likesCount', 'DESC']],
      limit: parseInt(limit)
    });

    // Get follower counts and following status for each post author
    const authorIds = [...new Set(posts.map(p => p.userId))];
    const followerCounts = await Promise.all(
      authorIds.map(async (authorId) => ({
        userId: authorId,
        count: await Follow.count({ where: { followingId: authorId } })
      }))
    );
    const followerCountMap = Object.fromEntries(followerCounts.map(f => [f.userId, f.count]));

    const followingRecords = await Follow.findAll({
      where: {
        followerId: currentUserId,
        followingId: authorIds
      }
    });
    const followingSet = new Set(followingRecords.map(f => f.followingId));

    const formattedPosts = posts.map((p) => {
      const formatted = formatPost(p, currentUserId);
      if (formatted.user) {
        formatted.user.followersCount = followerCountMap[formatted.user.id] || 0;
        formatted.user.isFollowing = followingSet.has(formatted.user.id);
      }
      return formatted;
    });
    res.json({ success: true, data: { posts: formattedPosts } });
  } catch (error) {
    console.error('Get explore posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching explore posts'
    });
  }
};

// Get reels (video posts from all users)
const getReels = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = req.user.id;
    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const { rows, count } = await Post.findAndCountAll({
      where: {
        [Op.or]: [
          { isReel: true },
          { mediaType: 'video' }
        ],
        visibility: 'public'
      },
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'fullName', 'profilePicture', 'isVerified'] },
        { model: Like, as: 'likes', attributes: ['userId'] },
        { model: Comment, as: 'comments', attributes: ['id'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: limitNum,
      offset: skip
    });

    // Get follower counts and following status for each post author
    const authorIds = [...new Set(rows.map(p => p.userId))];
    const followerCounts = await Promise.all(
      authorIds.map(async (authorId) => ({
        userId: authorId,
        count: await Follow.count({ where: { followingId: authorId } })
      }))
    );
    const followerCountMap = Object.fromEntries(followerCounts.map(f => [f.userId, f.count]));

    const followingRecords = authorIds.length > 0 ? await Follow.findAll({
      where: {
        followerId: currentUserId,
        followingId: authorIds
      }
    }) : [];
    const followingSet = new Set(followingRecords.map(f => f.followingId));

    const formattedPosts = rows.map((p) => {
      const formatted = formatPost(p, currentUserId);
      if (formatted.user) {
        formatted.user.followersCount = followerCountMap[formatted.user.id] || 0;
        formatted.user.isFollowing = followingSet.has(formatted.user.id);
      }
      return formatted;
    });

    const response = createPaginationResponse(formattedPosts, count, parseInt(page), parseInt(limit));
    res.json({ success: true, data: response });
  } catch (error) {
    console.error('Get reels error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reels'
    });
  }
};

module.exports = {
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
  getExplorePosts,
  getReels
};