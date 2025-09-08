const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TransportFee = sequelize.define('TransportFee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  feeId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Vehicle',
      key: 'id'
    }
  },
  route: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pickupPoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dropPoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  distance: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Distance in kilometers'
  },
  monthlyFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
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
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'cancelled'),
    allowNull: false,
    defaultValue: 'active'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'overdue', 'partial'),
    allowNull: false,
    defaultValue: 'pending'
  },
  lastPaymentDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  nextDueDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  remarks: {
    type: DataTypes.TEXT,
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
  tableName: 'TransportFee',
  timestamps: true
});

module.exports = TransportFee;
