const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransportPayment = sequelize.define('TransportPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  transportFeeId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'TransportFee',
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer', 'online', 'card'),
    allowNull: false,
    defaultValue: 'cash'
  },
  paymentReference: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cheque number, transaction ID, etc.'
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chequeNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  chequeDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled'),
    allowNull: false,
    defaultValue: 'completed'
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Month number (1-12)'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Year (e.g., 2024)'
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  collectedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  tableName: 'TransportPayment',
  timestamps: true
});

module.exports = TransportPayment;
