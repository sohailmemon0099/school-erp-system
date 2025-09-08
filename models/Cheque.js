const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cheque = sequelize.define('Cheque', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  chequeNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [1, 50]
    }
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  branchName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 30]
    }
  },
  accountHolderName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  issueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dueDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'cleared', 'bounced', 'cancelled', 'expired'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentType: {
    type: DataTypes.ENUM('fee_payment', 'transport_payment', 'other'),
    allowNull: false,
    defaultValue: 'fee_payment'
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  feePaymentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'FeePayment',
      key: 'id'
    }
  },
  transportPaymentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'TransportPayment',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025',
    validate: {
      notEmpty: true
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bouncedReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bouncedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  clearedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  processedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Cheques',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['chequeNumber']
    },
    {
      fields: ['status']
    },
    {
      fields: ['paymentType']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['academicYear']
    },
    {
      fields: ['issueDate', 'dueDate']
    },
    {
      fields: ['bankName']
    },
    {
      fields: ['processedBy']
    }
  ]
});

module.exports = Cheque;
