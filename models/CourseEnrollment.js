const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseEnrollment = sequelize.define('CourseEnrollment', {
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
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  completedAt: {
    type: DataTypes.DATE
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('enrolled', 'in_progress', 'completed', 'dropped'),
    defaultValue: 'enrolled'
  },
  grade: {
    type: DataTypes.STRING
  },
  certificateIssued: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = CourseEnrollment;
