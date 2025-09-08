const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudentParent = sequelize.define('StudentParent', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Parent',
      key: 'id'
    }
  },
  relationship: {
    type: DataTypes.ENUM('father', 'mother', 'guardian', 'other'),
    allowNull: false,
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: 'StudentParent',
  timestamps: true,
});

module.exports = StudentParent;
