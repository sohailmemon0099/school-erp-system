const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Hostel = sequelize.define('Hostel', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
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
  facilities: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  monthlyRent: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  wardenId: {
    type: DataTypes.UUID,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  contactNumber: {
    type: DataTypes.STRING,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'Hostel',
  timestamps: true,
});

module.exports = Hostel;
