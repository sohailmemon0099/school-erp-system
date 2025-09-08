const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Affidavit = sequelize.define('Affidavit', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  affidavitId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('birth_certificate', 'address_proof', 'income_certificate', 'caste_certificate', 'medical_certificate', 'other'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issuedBy: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issuedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  documentNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'),
    defaultValue: 'pending'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Affidavits',
  timestamps: true,
  hooks: {
    beforeCreate: async (affidavit) => {
      if (!affidavit.affidavitId) {
        const year = new Date().getFullYear();
        const count = await Affidavit.count();
        affidavit.affidavitId = `AFF-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = Affidavit;
