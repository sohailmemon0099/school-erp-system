const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MarkDistribution = sequelize.define('MarkDistribution', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Name of the mark distribution (e.g., "Standard", "CBSE", "ICSE")'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
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
    allowNull: true, // null means applies to all subjects
    references: {
      model: 'Subject',
      key: 'id'
    }
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '2024-2025'
  },
  semester: {
    type: DataTypes.ENUM(['1', '2', '3', '4', '5', '6', '7', '8']),
    allowNull: true
  },
  // Component-wise mark distribution
  theoryMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Theory marks out of total'
  },
  practicalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Practical marks out of total'
  },
  internalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Internal assessment marks out of total'
  },
  projectMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Project marks out of total'
  },
  assignmentMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Assignment marks out of total'
  },
  attendanceMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Attendance marks out of total'
  },
  totalMarks: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
    comment: 'Total marks for the subject'
  },
  // Grade calculation settings
  gradeSystem: {
    type: DataTypes.ENUM(['percentage', 'absolute', 'relative']),
    allowNull: false,
    defaultValue: 'percentage',
    comment: 'Grade calculation method'
  },
  passingPercentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 35.00,
    comment: 'Minimum percentage to pass'
  },
  gradeBoundaries: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Custom grade boundaries (e.g., {"A+": 90, "A": 80, "B+": 70})'
  },
  // Weightage settings
  theoryWeightage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'Weightage percentage for theory'
  },
  practicalWeightage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'Weightage percentage for practical'
  },
  internalWeightage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'Weightage percentage for internal assessment'
  },
  projectWeightage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'Weightage percentage for project'
  },
  assignmentWeightage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'Weightage percentage for assignments'
  },
  attendanceWeightage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.0,
    comment: 'Weightage percentage for attendance'
  },
  // Additional settings
  allowGraceMarks: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Whether to allow grace marks for borderline cases'
  },
  graceMarksLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Maximum grace marks that can be awarded'
  },
  roundingMethod: {
    type: DataTypes.ENUM(['round', 'ceil', 'floor', 'truncate']),
    allowNull: false,
    defaultValue: 'round',
    comment: 'Method for rounding final marks'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  }
}, {
  tableName: 'MarkDistribution',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['classId', 'subjectId', 'academicYear', 'semester']
    },
    {
      fields: ['classId']
    },
    {
      fields: ['subjectId']
    },
    {
      fields: ['academicYear']
    },
    {
      fields: ['isActive']
    }
  ]
});

// Validation: Ensure total marks equals sum of component marks
MarkDistribution.beforeValidate((distribution) => {
  const componentSum = distribution.theoryMarks + 
                      distribution.practicalMarks + 
                      distribution.internalMarks + 
                      distribution.projectMarks + 
                      distribution.assignmentMarks + 
                      distribution.attendanceMarks;
  
  if (componentSum !== distribution.totalMarks) {
    throw new Error('Sum of component marks must equal total marks');
  }
});

// Validation: Ensure weightages sum to 100%
MarkDistribution.beforeValidate((distribution) => {
  const weightageSum = distribution.theoryWeightage + 
                      distribution.practicalWeightage + 
                      distribution.internalWeightage + 
                      distribution.projectWeightage + 
                      distribution.assignmentWeightage + 
                      distribution.attendanceWeightage;
  
  if (Math.abs(weightageSum - 100.0) > 0.01) { // Allow small floating point errors
    throw new Error('Sum of weightages must equal 100%');
  }
});

module.exports = MarkDistribution;
