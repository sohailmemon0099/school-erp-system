const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransactionLog = sequelize.define('TransactionLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  transactionType: {
    type: DataTypes.ENUM('fee_payment', 'transport_payment', 'refund', 'adjustment', 'cheque_cleared', 'cheque_bounced', 'other'),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'cheque', 'online', 'card', 'bank_transfer', 'upi'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'INR',
    validate: {
      len: [3, 3]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
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
  chequeId: {
    type: DataTypes.UUID,
    allowNull: true
    // Temporarily remove foreign key reference to avoid dependency issues
    // references: {
    //   model: 'Cheque',
    //   key: 'id'
    // }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025',
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  referenceNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 100]
    }
  },
  gatewayTransactionId: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      len: [1, 100]
    }
  },
  gatewayResponse: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Gateway response data'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Additional transaction metadata'
  },
  processedAt: {
    type: DataTypes.DATE,
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
  tableName: 'TransactionLogs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['transactionId']
    },
    {
      fields: ['transactionType']
    },
    {
      fields: ['paymentMethod']
    },
    {
      fields: ['status']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['academicYear']
    },
    {
      fields: ['processedAt']
    },
    {
      fields: ['processedBy']
    },
    {
      fields: ['referenceNumber']
    },
    {
      fields: ['gatewayTransactionId']
    }
  ]
});

module.exports = TransactionLog;
