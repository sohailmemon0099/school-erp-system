const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Timetable = sequelize.define('Timetable', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Class',
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Subject',
      key: 'id'
    }
  },
  teacherId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Teacher',
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025'
  },
  semester: {
    type: DataTypes.ENUM('1', '2', '3', '4', '5', '6', '7', '8'),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  tableName: 'Timetables',
  timestamps: true,
  indexes: [
    {
      fields: ['classId', 'dayOfWeek', 'startTime']
    },
    {
      fields: ['teacherId', 'dayOfWeek', 'startTime']
    },
    {
      fields: ['subjectId', 'dayOfWeek', 'startTime']
    }
  ]
});

module.exports = Timetable;
