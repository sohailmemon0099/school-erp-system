const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HostelAllocation = sequelize.define('HostelAllocation', {
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
  hostelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Hostel',
      key: 'id'
    }
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'HostelRoom',
      key: 'id'
    }
  },
  allocationDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  checkInDate: {
    type: DataTypes.DATE,
  },
  checkOutDate: {
    type: DataTypes.DATE,
  },
  status: {
    type: DataTypes.ENUM('allocated', 'checked_in', 'checked_out', 'cancelled'),
    defaultValue: 'allocated',
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  depositPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  allocatedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  remarks: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'HostelAllocation',
  timestamps: true,
});

module.exports = HostelAllocation;
