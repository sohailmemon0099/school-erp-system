const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CircularAcknowledgment = sequelize.define('CircularAcknowledgment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  circularId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Circular',
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
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'CircularAcknowledgment',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['circularId', 'userId']
    },
    {
      fields: ['circularId']
    },
    {
      fields: ['userId']
    },
    {
      fields: ['acknowledgedAt']
    }
  ]
});

module.exports = CircularAcknowledgment;

