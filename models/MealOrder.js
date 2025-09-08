const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MealOrder = sequelize.define('MealOrder', {
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
  mealId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Meal',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  mealDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'),
    defaultValue: 'pending',
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending',
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'card', 'meal_plan', 'online'),
  },
  specialInstructions: {
    type: DataTypes.TEXT,
  },
  deliveredAt: {
    type: DataTypes.DATE,
  },
  deliveredBy: {
    type: DataTypes.UUID,
    references: {
      model: 'User',
      key: 'id'
    }
  },
}, {
  tableName: 'MealOrder',
  timestamps: true,
});

module.exports = MealOrder;
