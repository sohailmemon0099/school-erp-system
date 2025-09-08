const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Course',
      key: 'id'
    }
  },
  lessonId: {
    type: DataTypes.UUID,
    references: {
      model: 'Lesson',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  instructions: {
    type: DataTypes.TEXT
  },
  timeLimit: {
    type: DataTypes.INTEGER, // in minutes
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  passingMarks: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  startDate: {
    type: DataTypes.DATE
  },
  endDate: {
    type: DataTypes.DATE
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
});

module.exports = Quiz;
