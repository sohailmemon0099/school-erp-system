const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BulkSMS = sequelize.define('BulkSMS', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  campaignId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recipientType: {
    type: DataTypes.ENUM('all_students', 'all_teachers', 'all_parents', 'specific_class', 'specific_students', 'custom_numbers'),
    allowNull: false
  },
  recipientIds: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Array of student/teacher/parent IDs or phone numbers'
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Class',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'),
    defaultValue: 'draft'
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  totalRecipients: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  sentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  failedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  deliveryReport: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Detailed delivery report with status for each recipient'
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'BulkSMS',
  timestamps: true,
  hooks: {
    beforeCreate: async (bulkSMS) => {
      if (!bulkSMS.campaignId) {
        const year = new Date().getFullYear();
        const count = await BulkSMS.count();
        bulkSMS.campaignId = `SMS-${year}-${String(count + 1).padStart(4, '0')}`;
      }
    }
  }
});

module.exports = BulkSMS;
