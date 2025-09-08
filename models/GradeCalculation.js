const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GradeCalculation = sequelize.define('GradeCalculation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Student',
      key: 'id'
    }
  },
  classId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Class',
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
  markDistributionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'MarkDistribution',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.ENUM(['1', '2', '3', '4', '5', '6', '7', '8']),
    allowNull: true
  },
  // Component-wise marks obtained
  theoryMarksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  practicalMarksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  internalMarksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  projectMarksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  assignmentMarksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  attendanceMarksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  // Calculated values
  totalMarksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0
  },
  totalMarksPossible: {
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
    type: DataTypes.STRING(3),
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
  graceMarksAwarded: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calculatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  calculatedBy: {
    type: DataTypes.UUID,
    allowNull: true,
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
  tableName: 'GradeCalculation',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'classId', 'subjectId', 'academicYear', 'semester']
    },
    {
      fields: ['studentId']
    },
    {
      fields: ['classId']
    },
    {
      fields: ['subjectId']
    },
    {
      fields: ['markDistributionId']
    },
    {
      fields: ['academicYear']
    },
    {
      fields: ['grade']
    },
    {
      fields: ['status']
    }
  ]
});

// Calculate total marks and percentage before saving
GradeCalculation.beforeSave(async (calculation) => {
  // Get the mark distribution
  const MarkDistribution = require('./MarkDistribution');
  const distribution = await MarkDistribution.findByPk(calculation.markDistributionId);
  
  if (distribution) {
    // Calculate total marks obtained
    calculation.totalMarksObtained = 
      calculation.theoryMarksObtained + 
      calculation.practicalMarksObtained + 
      calculation.internalMarksObtained + 
      calculation.projectMarksObtained + 
      calculation.assignmentMarksObtained + 
      calculation.attendanceMarksObtained;
    
    // Set total marks possible
    calculation.totalMarksPossible = distribution.totalMarks;
    
    // Calculate percentage
    if (calculation.totalMarksPossible > 0) {
      calculation.percentage = (calculation.totalMarksObtained / calculation.totalMarksPossible) * 100;
    }
    
    // Apply grace marks if needed
    if (distribution.allowGraceMarks && 
        calculation.percentage < distribution.passingPercentage && 
        calculation.graceMarksAwarded < distribution.graceMarksLimit) {
      
      const marksNeeded = (distribution.passingPercentage / 100) * calculation.totalMarksPossible - calculation.totalMarksObtained;
      const graceMarks = Math.min(marksNeeded, distribution.graceMarksLimit - calculation.graceMarksAwarded);
      
      if (graceMarks > 0) {
        calculation.graceMarksAwarded += graceMarks;
        calculation.totalMarksObtained += graceMarks;
        calculation.percentage = (calculation.totalMarksObtained / calculation.totalMarksPossible) * 100;
      }
    }
    
    // Calculate grade and grade point
    if (distribution.gradeBoundaries) {
      const boundaries = distribution.gradeBoundaries;
      const percentage = calculation.percentage;
      
      if (percentage >= boundaries['A+']) {
        calculation.grade = 'A+';
        calculation.gradePoint = 10.0;
      } else if (percentage >= boundaries['A']) {
        calculation.grade = 'A';
        calculation.gradePoint = 9.0;
      } else if (percentage >= boundaries['B+']) {
        calculation.grade = 'B+';
        calculation.gradePoint = 8.0;
      } else if (percentage >= boundaries['B']) {
        calculation.grade = 'B';
        calculation.gradePoint = 7.0;
      } else if (percentage >= boundaries['C+']) {
        calculation.grade = 'C+';
        calculation.gradePoint = 6.0;
      } else if (percentage >= boundaries['C']) {
        calculation.grade = 'C';
        calculation.gradePoint = 5.0;
      } else if (percentage >= boundaries['D']) {
        calculation.grade = 'D';
        calculation.gradePoint = 4.0;
      } else {
        calculation.grade = 'F';
        calculation.gradePoint = 0.0;
      }
    } else {
      // Default grade calculation
      if (calculation.percentage >= 90) {
        calculation.grade = 'A+';
        calculation.gradePoint = 10.0;
      } else if (calculation.percentage >= 80) {
        calculation.grade = 'A';
        calculation.gradePoint = 9.0;
      } else if (calculation.percentage >= 70) {
        calculation.grade = 'B+';
        calculation.gradePoint = 8.0;
      } else if (calculation.percentage >= 60) {
        calculation.grade = 'B';
        calculation.gradePoint = 7.0;
      } else if (calculation.percentage >= 50) {
        calculation.grade = 'C+';
        calculation.gradePoint = 6.0;
      } else if (calculation.percentage >= 40) {
        calculation.grade = 'C';
        calculation.gradePoint = 5.0;
      } else if (calculation.percentage >= 35) {
        calculation.grade = 'D';
        calculation.gradePoint = 4.0;
      } else {
        calculation.grade = 'F';
        calculation.gradePoint = 0.0;
      }
    }
    
    // Determine status
    if (calculation.percentage >= distribution.passingPercentage) {
      calculation.status = 'pass';
    } else {
      calculation.status = 'fail';
    }
  }
});

module.exports = GradeCalculation;
