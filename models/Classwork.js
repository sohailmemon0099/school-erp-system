const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Classwork = sequelize.define('Classwork', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  classworkId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('assignment', 'project', 'homework', 'quiz', 'test', 'presentation', 'other'),
    allowNull: false,
    defaultValue: 'assignment'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maxMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of file attachments'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'closed', 'graded'),
    allowNull: false,
    defaultValue: 'draft'
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
    allowNull: false,
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
  tableName: 'Classwork',
  timestamps: true
});

module.exports = Classwork;
