const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relatedPostId: {
    type: DataTypes.UUID,
    references: {
      model: 'Posts',
      key: 'id'
    },
    defaultValue: null
  },
  relatedChatId: {
    type: DataTypes.UUID,
    references: {
      model: 'Chats',
      key: 'id'
    },
    defaultValue: null
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    defaultValue: null
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Convenience helpers to mirror previous Mongoose statics
Notification.createNotification = async (payload) => {
  return Notification.create(payload);
};

Notification.getUserNotifications = async (userId, page = 1, limit = 20) => {
  return Notification.findAll({
    where: { recipientId: userId },
    order: [['createdAt', 'DESC']],
    limit,
    offset: (page - 1) * limit
  });
};

Notification.getUnreadCount = async (userId) => {
  return Notification.count({ where: { recipientId: userId, isRead: false } });
};

Notification.markAsRead = async (userId, ids) => {
  return Notification.update(
    { isRead: true, readAt: new Date() },
    { where: { recipientId: userId, id: ids } }
  );
};

module.exports = Notification;