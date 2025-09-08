const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamSchedule = sequelize.define('ExamSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Exam',
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
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Class',
      key: 'id'
    }
  },
  examDate: {
    type: DataTypes.DATEONLY,
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
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  maxMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100
  },
  passingMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 35
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invigilatorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Teacher',
      key: 'id'
    }
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(['scheduled', 'ongoing', 'completed', 'cancelled']),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'ExamSchedule',
  timestamps: true,
  indexes: [
    {
      fields: ['examId']
    },
    {
      fields: ['subjectId']
    },
    {
      fields: ['classId']
    },
    {
      fields: ['examDate']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = ExamSchedule;
