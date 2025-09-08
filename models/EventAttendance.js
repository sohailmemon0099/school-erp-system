const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EventAttendance = sequelize.define('EventAttendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  eventId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Event',
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
  status: {
    type: DataTypes.ENUM('attending', 'maybe', 'not_attending'),
    allowNull: false,
    defaultValue: 'attending'
  },
  registeredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = EventAttendance;
