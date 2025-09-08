const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vehicleNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  vehicleType: {
    type: DataTypes.ENUM('bus', 'van', 'car'),
    allowNull: false,
    defaultValue: 'bus'
  },
  make: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  conductorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  route: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  monthlyFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  insuranceNumber: {
    type: DataTypes.STRING
  },
  insuranceExpiry: {
    type: DataTypes.DATE
  },
  registrationNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  registrationExpiry: {
    type: DataTypes.DATE
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Vehicle;
