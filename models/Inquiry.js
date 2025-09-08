const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inquiry = sequelize.define('Inquiry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  inquiryId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // Student Information
  studentFirstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  studentLastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  studentDateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  studentGender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  studentBloodGroup: {
    type: DataTypes.STRING,
    allowNull: true
  },
  studentPreviousSchool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  studentPreviousClass: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Parent Information
  parentFirstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  parentLastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 50]
    }
  },
  parentPhone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [10, 15]
    }
  },
  parentEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isValidEmail(value) {
        if (value && value.trim() !== '') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            throw new Error('Please provide a valid email address');
          }
        }
      }
    }
  },
  parentOccupation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  parentAddress: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  
  // Emergency Contact
  emergencyContactName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  emergencyContactRelation: {
    type: DataTypes.STRING,
    allowNull: true
  },
  
  // Academic Information
  desiredClass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  desiredAcademicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  preferredSubjects: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Inquiry Details
  inquiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  inquirySource: {
    type: DataTypes.ENUM('website', 'walk-in', 'phone', 'referral', 'social-media', 'advertisement', 'other'),
    allowNull: false,
    defaultValue: 'walk-in'
  },
  inquiryNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Status and Follow-up
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'follow-up', 'interested', 'not-interested', 'admitted', 'cancelled'),
    allowNull: false,
    defaultValue: 'new'
  },
  followUpDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  followUpNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
  // Communication
  smsSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  whatsappSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  
  // Admission
  admissionConfirmed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  admissionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  
  // System fields
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'Inquiries',
  timestamps: true,
});

module.exports = Inquiry;
