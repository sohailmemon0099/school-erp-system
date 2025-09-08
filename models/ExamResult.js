const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamResult = sequelize.define('ExamResult', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  examId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Exam',
      key: 'id'
    }
  },
  examScheduleId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ExamSchedule',
      key: 'id'
    }
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Subject',
      key: 'id'
    }
  },
  marksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  maxMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  grade: {
    type: DataTypes.STRING,
    allowNull: true
  },
  gradePoint: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(['pass', 'fail', 'absent', 'exempted']),
    allowNull: false,
    defaultValue: 'absent'
  },
  rank: {
    type: DataTypes.INTEGER,
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
  },
  gradedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  gradedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'ExamResult',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['examId', 'studentId', 'subjectId']
    },
    {
      fields: ['examId']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['subjectId']
    },
    {
      fields: ['status']
    },
    {
      fields: ['grade']
    }
  ]
});

// Calculate percentage and grade
ExamResult.beforeSave(async (result) => {
  if (result.marksObtained !== null && result.maxMarks > 0) {
    result.percentage = (result.marksObtained / result.maxMarks) * 100;
    
    // Grade calculation
    if (result.percentage >= 90) {
      result.grade = 'A+';
      result.gradePoint = 10.0;
    } else if (result.percentage >= 80) {
      result.grade = 'A';
      result.gradePoint = 9.0;
    } else if (result.percentage >= 70) {
      result.grade = 'B+';
      result.gradePoint = 8.0;
    } else if (result.percentage >= 60) {
      result.grade = 'B';
      result.gradePoint = 7.0;
    } else if (result.percentage >= 50) {
      result.grade = 'C+';
      result.gradePoint = 6.0;
    } else if (result.percentage >= 40) {
      result.grade = 'C';
      result.gradePoint = 5.0;
    } else if (result.percentage >= 35) {
      result.grade = 'D';
      result.gradePoint = 4.0;
    } else {
      result.grade = 'F';
      result.gradePoint = 0.0;
    }
    
    // Status determination
    if (result.percentage >= 35) {
      result.status = 'pass';
    } else {
      result.status = 'fail';
    }
  }
});

module.exports = ExamResult;