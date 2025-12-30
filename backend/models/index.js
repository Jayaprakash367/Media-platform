const sequelize = require('../config/database');
const User = require('./User');
const Post = require('./Post');
const Message = require('./Message');
const Chat = require('./Chat');
const Story = require('./Story');
const Notification = require('./Notification');
const Comment = require('./Comment');
const Like = require('./Like');
const Follow = require('./Follow');
const FollowRequest = require('./FollowRequest');
const Save = require('./Save');

// Define associations
// User relationships
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
User.hasMany(Chat, { foreignKey: 'participant1Id', as: 'chatsAsParticipant1' });
User.hasMany(Chat, { foreignKey: 'participant2Id', as: 'chatsAsParticipant2' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });
User.hasMany(Story, { foreignKey: 'userId', as: 'stories' });
User.hasMany(Notification, { foreignKey: 'recipientId', as: 'receivedNotifications' });
User.hasMany(Notification, { foreignKey: 'senderId', as: 'sentNotifications' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
User.hasMany(Like, { foreignKey: 'userId', as: 'likes' });
User.hasMany(Save, { foreignKey: 'userId', as: 'saves' });

// Follow relationships
User.belongsToMany(User, { 
  through: Follow, 
  as: 'followers', 
  foreignKey: 'followingId', 
  otherKey: 'followerId' 
});
User.belongsToMany(User, { 
  through: Follow, 
  as: 'following', 
  foreignKey: 'followerId', 
  otherKey: 'followingId' 
});

Follow.belongsTo(User, { foreignKey: 'followerId', as: 'follower' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'followingUser' });

// Follow Request relationships
User.hasMany(FollowRequest, { foreignKey: 'senderId', as: 'sentFollowRequests' });
User.hasMany(FollowRequest, { foreignKey: 'receiverId', as: 'receivedFollowRequests' });
FollowRequest.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
FollowRequest.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Post relationships
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.hasMany(Notification, { foreignKey: 'relatedPostId', as: 'notifications' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });
Post.hasMany(Like, { foreignKey: 'postId', as: 'likes' });
Post.hasMany(Save, { foreignKey: 'postId', as: 'saves' });

// Comment relationships
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Like relationships
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Like.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Save relationships
Save.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Save.belongsTo(Post, { foreignKey: 'postId', as: 'post' });

// Message relationships
Message.belongsTo(Chat, { foreignKey: 'chatId', as: 'chat' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

// Chat relationships
Chat.belongsTo(User, { foreignKey: 'participant1Id', as: 'participant1' });
Chat.belongsTo(User, { foreignKey: 'participant2Id', as: 'participant2' });
Chat.hasMany(Message, { foreignKey: 'chatId', as: 'messages' });
Chat.hasMany(Notification, { foreignKey: 'relatedChatId', as: 'notifications' });

// Story relationships
Story.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Notification relationships
Notification.belongsTo(User, { foreignKey: 'recipientId', as: 'recipient' });
Notification.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Notification.belongsTo(Post, { foreignKey: 'relatedPostId', as: 'relatedPost' });
Notification.belongsTo(Chat, { foreignKey: 'relatedChatId', as: 'relatedChat' });

module.exports = {
  sequelize,
  User,
  Post,
  Message,
  Chat,
  Story,
  Notification,
  Comment,
  Like,
  Follow,
  FollowRequest,
  Save
};
