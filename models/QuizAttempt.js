const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Quiz',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  startedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE
  },
  timeSpent: {
    type: DataTypes.INTEGER // in minutes
  },
  score: {
    type: DataTypes.INTEGER
  },
  totalMarks: {
    type: DataTypes.INTEGER
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2)
  },
  status: {
    type: DataTypes.ENUM('in_progress', 'completed', 'abandoned'),
    defaultValue: 'in_progress'
  },
  answers: {
    type: DataTypes.JSON // Store student answers
  }
});

module.exports = QuizAttempt;
