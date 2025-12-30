const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Save = sequelize.define('Save', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  }
}, {
  indexes: [{ unique: true, fields: ['postId', 'userId'] }]
});

module.exports = Save;
