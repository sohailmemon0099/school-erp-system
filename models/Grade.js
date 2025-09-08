const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Grade = sequelize.define('Grade', {
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
  subjectId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Subject',
      key: 'id'
    }
  },
  examType: {
    type: DataTypes.ENUM('quiz', 'midterm', 'final', 'assignment', 'project'),
    allowNull: false
  },
  examName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  marksObtained: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  totalMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2)
  },
  grade: {
    type: DataTypes.STRING(2)
  },
  examDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT
  },
  academicYear: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.STRING
  }
});

// Calculate percentage and grade before saving
Grade.beforeSave((grade) => {
  if (grade.marksObtained && grade.totalMarks) {
    grade.percentage = (grade.marksObtained / grade.totalMarks) * 100;
    
    // Grade calculation
    if (grade.percentage >= 90) grade.grade = 'A+';
    else if (grade.percentage >= 80) grade.grade = 'A';
    else if (grade.percentage >= 70) grade.grade = 'B+';
    else if (grade.percentage >= 60) grade.grade = 'B';
    else if (grade.percentage >= 50) grade.grade = 'C+';
    else if (grade.percentage >= 40) grade.grade = 'C';
    else if (grade.percentage >= 33) grade.grade = 'D';
    else grade.grade = 'F';
  }
});

module.exports = Grade;
