const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  category: {
    type: DataTypes.ENUM('furniture', 'equipment', 'books', 'supplies', 'electronics', 'sports', 'other'),
    allowNull: false,
  },
  itemCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unitPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
  },
  supplier: {
    type: DataTypes.STRING,
  },
  purchaseDate: {
    type: DataTypes.DATE,
  },
  warrantyExpiry: {
    type: DataTypes.DATE,
  },
  condition: {
    type: DataTypes.ENUM('excellent', 'good', 'fair', 'poor', 'damaged'),
    defaultValue: 'good',
  },
  status: {
    type: DataTypes.ENUM('available', 'in_use', 'maintenance', 'disposed'),
    defaultValue: 'available',
  },
  assignedTo: {
    type: DataTypes.UUID,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  assignedDate: {
    type: DataTypes.DATE,
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'Inventory',
  timestamps: true,
});

module.exports = Inventory;
