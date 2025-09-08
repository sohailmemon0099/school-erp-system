const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizQuestion = sequelize.define('QuizQuestion', {
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
  question: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  questionType: {
    type: DataTypes.ENUM('multiple_choice', 'true_false', 'short_answer', 'essay'),
    allowNull: false
  },
  options: {
    type: DataTypes.JSON // For multiple choice questions
  },
  correctAnswer: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT
  },
  marks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = QuizQuestion;
