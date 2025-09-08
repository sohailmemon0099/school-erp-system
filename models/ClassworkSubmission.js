const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ClassworkSubmission = sequelize.define('ClassworkSubmission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classworkId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Classwork',
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
  submissionText: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of submitted file attachments'
  },
  submittedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  marksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('not_submitted', 'submitted', 'late', 'graded', 'returned'),
    allowNull: false,
    defaultValue: 'not_submitted'
  },
  isLate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  latePenalty: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  gradedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'ClassworkSubmission',
  timestamps: true
});

module.exports = ClassworkSubmission;
