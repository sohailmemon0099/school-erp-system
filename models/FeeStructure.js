const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeeStructure = sequelize.define('FeeStructure', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  feeType: {
    type: DataTypes.ENUM('tuition', 'transport', 'hostel', 'library', 'exam', 'sports', 'other'),
    allowNull: false,
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Class',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  lateFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  lateFeeDays: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  installmentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  installmentInterval: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'semester', 'yearly'),
    defaultValue: 'yearly',
  },
}, {
  tableName: 'FeeStructure',
  timestamps: true,
});

module.exports = FeeStructure;
