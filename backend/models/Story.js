const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Story = sequelize.define('Story', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  mediaType: {
    type: DataTypes.ENUM('image', 'video'),
    allowNull: false,
    defaultValue: 'image'
  },
  viewersCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
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

Story.getActiveStories = async (userIds = []) => {
  const now = new Date();
  return Story.findAll({
    where: {
      userId: userIds,
      expiresAt: { [sequelize.Sequelize.Op.gt]: now }
    },
    order: [['createdAt', 'DESC']],
    include: [{ association: Story.associations?.user }]
  });
};

Story.getUserStories = async (userId) => {
  const now = new Date();
  return Story.findAll({
    where: { userId, expiresAt: { [sequelize.Sequelize.Op.gt]: now } },
    order: [['createdAt', 'DESC']]
  });
};

// Placeholder to keep API compatibility
Story.prototype.markAsViewed = function () {
  return false; // No-op for now
};

module.exports = Story;