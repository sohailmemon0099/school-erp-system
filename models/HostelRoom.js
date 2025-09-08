const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HostelRoom = sequelize.define('HostelRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  hostelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Hostel',
      key: 'id'
    }
  },
  roomNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  floor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  occupied: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  roomType: {
    type: DataTypes.ENUM('single', 'double', 'triple', 'quad'),
    allowNull: false,
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  facilities: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  status: {
    type: DataTypes.ENUM('available', 'occupied', 'maintenance', 'reserved'),
    defaultValue: 'available',
  },
}, {
  tableName: 'HostelRoom',
  timestamps: true,
});

module.exports = HostelRoom;
