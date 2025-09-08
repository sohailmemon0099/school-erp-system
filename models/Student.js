const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  admissionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Class',
      key: 'id'
    }
  },
  parentName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  parentEmail: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true
    }
  },
  emergencyContact: {
    type: DataTypes.STRING
  },
  medicalInfo: {
    type: DataTypes.TEXT
  },
  transportRoute: {
    type: DataTypes.STRING
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
});

module.exports = Student;
