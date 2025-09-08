const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cafeteria = sequelize.define('Cafeteria', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  operatingHours: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  managerId: {
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
  tableName: 'Cafeteria',
  timestamps: true,
});

module.exports = Cafeteria;
