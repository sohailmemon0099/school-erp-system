const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BonafideCertificate = sequelize.define('BonafideCertificate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  certificateNumber: {
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
  purpose: {
    type: DataTypes.ENUM([
      'scholarship',
      'passport',
      'visa',
      'bank_account',
      'employment',
      'admission',
      'other'
    ]),
    allowNull: false
  },
  purposeDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  issuedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(['draft', 'issued', 'cancelled', 'expired']),
    allowNull: false,
    defaultValue: 'draft'
  },
  issuedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'BonafideCertificates',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['certificateNumber']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['issuedDate']
    }
  ]
});

// Generate certificate number
BonafideCertificate.beforeCreate(async (certificate) => {
  if (!certificate.certificateNumber) {
    const year = new Date().getFullYear();
    const count = await BonafideCertificate.count({
      where: {
        issuedDate: {
          [sequelize.Sequelize.Op.gte]: new Date(`${year}-01-01`),
          [sequelize.Sequelize.Op.lt]: new Date(`${year + 1}-01-01`)
        }
      }
    });
    certificate.certificateNumber = `BON-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = BonafideCertificate;
