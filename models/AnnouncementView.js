const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnnouncementView = sequelize.define('AnnouncementView', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  announcementId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Announcement',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  viewedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = AnnouncementView;
