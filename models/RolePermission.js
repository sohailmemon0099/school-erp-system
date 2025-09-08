const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  role: {
    type: DataTypes.ENUM('admin', 'teacher', 'student', 'clark', 'parent', 'staff'),
    allowNull: false,
    unique: true
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: {}
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'role_permissions',
  timestamps: true
});

module.exports = RolePermission;
