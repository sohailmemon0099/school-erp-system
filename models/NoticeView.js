const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NoticeView = sequelize.define('NoticeView', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  noticeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Notice',
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
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [0, 45]
    }
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'NoticeViews',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['noticeId', 'userId']
    },
    {
      fields: ['noticeId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['viewedAt']
    }
  ]
});

module.exports = NoticeView;

