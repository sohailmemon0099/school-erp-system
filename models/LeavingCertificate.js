const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LeavingCertificate = sequelize.define('LeavingCertificate', {
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
  leavingDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reasonForLeaving: {
    type: DataTypes.ENUM([
      'transfer',
      'completion',
      'withdrawal',
      'expulsion',
      'migration',
      'other'
    ]),
    allowNull: false
  },
  reasonDescription: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  lastClassAttended: {
    type: DataTypes.STRING,
    allowNull: false
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  conduct: {
    type: DataTypes.ENUM(['excellent', 'very_good', 'good', 'satisfactory', 'unsatisfactory']),
    allowNull: false,
    defaultValue: 'good'
  },
  attendancePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  feesPaid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  libraryBooksReturned: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  noDuesCertificate: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.ENUM(['draft', 'issued', 'cancelled']),
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
  issuedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
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
  tableName: 'LeavingCertificates',
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
      fields: ['leavingDate']
    }
  ]
});

// Generate certificate number
LeavingCertificate.beforeCreate(async (certificate) => {
  if (!certificate.certificateNumber) {
    const year = new Date().getFullYear();
    const count = await LeavingCertificate.count({
      where: {
        leavingDate: {
          [sequelize.Sequelize.Op.gte]: new Date(`${year}-01-01`),
          [sequelize.Sequelize.Op.lt]: new Date(`${year + 1}-01-01`)
        }
      }
    });
    certificate.certificateNumber = `LC-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = LeavingCertificate;
