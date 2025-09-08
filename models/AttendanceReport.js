const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AttendanceReport = sequelize.define('AttendanceReport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reportId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reportType: {
    type: DataTypes.ENUM('monthly', 'quarterly', 'yearly', 'custom', 'class_wise', 'student_wise', 'teacher_wise'),
    allowNull: false,
    defaultValue: 'monthly'
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025',
    validate: {
      notEmpty: true
    }
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
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
  teacherId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Teacher',
      key: 'id'
    }
  },
  totalDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  presentDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  absentDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  lateDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  halfDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  attendancePercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
    validate: {
      min: 0,
      max: 100
    }
  },
  status: {
    type: DataTypes.ENUM('draft', 'generated', 'published', 'archived'),
    allowNull: false,
    defaultValue: 'draft'
  },
  reportData: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Detailed attendance data in JSON format'
  },
  summary: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Report summary and statistics'
  },
  filters: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Applied filters for report generation'
  },
  generatedBy: {
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
  tableName: 'AttendanceReports',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['reportId']
    },
    {
      fields: ['reportType']
    },
    {
      fields: ['academicYear']
    },
    {
      fields: ['startDate', 'endDate']
    },
    {
      fields: ['classId']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['teacherId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['generatedBy']
    }
  ]
});

module.exports = AttendanceReport;