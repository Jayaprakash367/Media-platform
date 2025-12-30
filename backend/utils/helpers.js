const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Helper to normalize Sequelize instances/plain objects and expose both id and _id
const normalizeEntity = (entity) => {
  if (!entity) return entity;
  const plain = typeof entity.toJSON === 'function' ? entity.toJSON() : { ...entity };
  if (plain.id && !plain._id) plain._id = plain.id;
  return plain;
};

// Extract hashtags from text
const extractHashtags = (text) => {
  const hashtagRegex = /#\w+/g;
  const matches = text.match(hashtagRegex) || [];
  return matches.map(tag => tag.substring(1).toLowerCase());
};

// Extract mentions from text
const extractMentions = (text) => {
  const mentionRegex = /@\w+/g;
  const matches = text.match(mentionRegex) || [];
  return matches.map(mention => mention.substring(1));
};

// Format post data for response
const formatPost = (post, userId = null) => {
  if (!post) return null;
  const postData = normalizeEntity(post);

  // Attach aliased user if present
  if (post.user) {
    postData.user = formatUser(post.user);
  } else if (post.User) {
    postData.user = formatUser(post.User);
  }

  // Likes & comments counts
  const likes = post.Likes || post.likes || [];
  const comments = post.Comments || post.comments || [];
  postData.likesCount = postData.likesCount ?? likes.length;
  postData.commentsCount = postData.commentsCount ?? comments.length;

  // Add isLikedByUser flag if we know the current user
  if (userId) {
    postData.isLikedByUser = likes.some((like) => {
      const likeUserId = like.userId || (typeof like.toJSON === 'function' ? like.toJSON().userId : null);
      return likeUserId === userId;
    });
  }

  delete postData.__v;
  delete postData.password;
  return postData;
};

// Format user data for response
const formatUser = (user) => {
  if (!user) return null;
  const userData = normalizeEntity(user);
  delete userData.password;
  delete userData.__v;
  delete userData.email;
  return userData;
};

// Paginate results
const paginate = (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    limit: parseInt(limit),
    page: parseInt(page)
  };
};

// Create pagination response
const createPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

// Calculate time ago
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  if (interval === 1) return "1 year ago";
  
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  if (interval === 1) return "1 month ago";
  
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  if (interval === 1) return "1 day ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  if (interval === 1) return "1 hour ago";
  
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  if (interval === 1) return "1 minute ago";
  
  return "just now";
};

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Sanitize text (basic HTML sanitization)
const sanitizeText = (text) => {
  if (!text) return '';
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// Calculate engagement score
const calculateEngagementScore = (likesCount, commentsCount) => {
  return likesCount + (commentsCount * 2); // Comments are weighted more
};

// Check if user can interact with content
const canUserInteract = (user, contentAuthor) => {
  const userId = user?.id || user?._id;
  const authorId = contentAuthor?.id || contentAuthor?._id;
  if (!userId || !authorId) return false;

  if (userId === authorId) return true;
  if (!contentAuthor.isPrivate) return true;

  const followers = contentAuthor.followers || [];
  return followers.some((f) => {
    const fid = f.id || f._id;
    return fid === userId;
  });
};

// Generate notification message
const generateNotificationMessage = (type, senderName) => {
  const messages = {
    like: `${senderName} liked your post`,
    comment: `${senderName} commented on your post`,
    follow: `${senderName} started following you`,
    message: `${senderName} sent you a message`,
    mention: `${senderName} mentioned you`
  };
  
  return messages[type] || `${senderName} interacted with your content`;
};

// Validate media URL
const isValidMediaUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  generateToken,
  extractHashtags,
  extractMentions,
  formatPost,
  formatUser,
  paginate,
  createPaginationResponse,
  timeAgo,
  generateRandomString,
  sanitizeText,
  calculateEngagementScore,
  canUserInteract,
  generateNotificationMessage,
  isValidMediaUrl
};