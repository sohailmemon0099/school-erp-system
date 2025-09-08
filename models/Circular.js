const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Circular = sequelize.define('Circular', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  circularId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  circularType: {
    type: DataTypes.ENUM('administrative', 'academic', 'disciplinary', 'policy', 'procedure', 'announcement', 'reminder', 'update'),
    allowNull: false,
    defaultValue: 'administrative'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    allowNull: false,
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived', 'expired'),
    allowNull: false,
    defaultValue: 'draft'
  },
  targetAudience: {
    type: DataTypes.ENUM('all', 'students', 'teachers', 'parents', 'staff', 'specific_class', 'specific_student'),
    allowNull: false,
    defaultValue: 'all'
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Class',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025',
    validate: {
      notEmpty: true
    }
  },
  publishDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  effectiveDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isSticky: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isImportant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  requiresAcknowledgment: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  acknowledgmentDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of attachment file information'
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of tags for categorization'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  acknowledgmentCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
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
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Circulars',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['circularId']
    },
    {
      fields: ['circularType']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['status']
    },
    {
      fields: ['targetAudience']
    },
    {
      fields: ['classId']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['academicYear']
    },
    {
      fields: ['publishDate']
    },
    {
      fields: ['expiryDate']
    },
    {
      fields: ['effectiveDate']
    },
    {
      fields: ['isSticky']
    },
    {
      fields: ['isImportant']
    },
    {
      fields: ['requiresAcknowledgment']
    },
    {
      fields: ['createdBy']
    }
  ]
});

module.exports = Circular;

