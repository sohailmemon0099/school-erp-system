const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransactionReport = sequelize.define('TransactionReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  transactionType: {
    type: DataTypes.ENUM('fee_payment', 'transport_payment', 'library_fine', 'cafeteria_payment', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMode: {
    type: DataTypes.ENUM('cash', 'cheque', 'card', 'online', 'bank_transfer'),
    allowNull: false
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  receiptNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    defaultValue: 'completed'
  },
  referenceId: {
    type: DataTypes.UUID // Reference to FeePayment, TransportPayment, etc.
  },
  referenceType: {
    type: DataTypes.STRING // 'FeePayment', 'TransportPayment', etc.
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
});

module.exports = TransactionReport;
