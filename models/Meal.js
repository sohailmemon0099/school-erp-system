const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Meal = sequelize.define('Meal', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  cafeteriaId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Cafeteria',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  ingredients: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  allergens: {
    type: DataTypes.JSON,
    defaultValue: [],
  },
  nutritionalInfo: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  availableFrom: {
    type: DataTypes.TIME,
  },
  availableTo: {
    type: DataTypes.TIME,
  },
  imageUrl: {
    type: DataTypes.STRING,
  },
}, {
  tableName: 'Meal',
  timestamps: true,
});

module.exports = Meal;
