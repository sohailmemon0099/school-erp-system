const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FeePayment = sequelize.define('FeePayment', {
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
  feeStructureId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'FeeStructure',
      key: 'id'
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  balanceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'partial', 'paid', 'overdue'),
    defaultValue: 'pending',
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  paidDate: {
    type: DataTypes.DATE,
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'cheque', 'bank_transfer', 'online', 'card'),
  },
  transactionId: {
    type: DataTypes.STRING,
  },
  receiptNumber: {
    type: DataTypes.STRING,
  },
  installmentNumber: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  lateFeeAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  discountReason: {
    type: DataTypes.STRING,
  },
  remarks: {
    type: DataTypes.TEXT,
  },
  collectedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'User',
      key: 'id'
    }
  },
}, {
  tableName: 'FeePayment',
  timestamps: true,
});

module.exports = FeePayment;
