const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Fee = sequelize.define('Fee', {
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
  feeType: {
    type: DataTypes.ENUM('tuition', 'transport', 'library', 'sports', 'exam', 'other'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paidAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  paidDate: {
    type: DataTypes.DATEONLY
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'partial', 'overdue'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'cheque', 'online')
  },
  transactionId: {
    type: DataTypes.STRING
  },
  remarks: {
    type: DataTypes.TEXT
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING
  }
});

// Calculate status before saving
Fee.beforeSave((fee) => {
  if (fee.paidAmount > 0) {
    if (fee.paidAmount >= fee.amount) {
      fee.status = 'paid';
    } else {
      fee.status = 'partial';
    }
  } else if (fee.dueDate && new Date(fee.dueDate) < new Date()) {
    fee.status = 'overdue';
  }
});

module.exports = Fee;
