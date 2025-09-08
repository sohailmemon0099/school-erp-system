const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Exam = sequelize.define('Exam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  examId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  examType: {
    type: DataTypes.ENUM([
      'unit_test',
      'mid_term',
      'final_exam',
      'quarterly',
      'half_yearly',
      'annual',
      'competitive',
      'entrance',
      'other'
    ]),
    allowNull: false,
    defaultValue: 'unit_test'
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
    allowNull: true,
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
  startDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Duration in minutes'
  },
  maxMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 100
  },
  passingMarks: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 35
  },
  instructions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  venue: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hallTicketRequired: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  hallTicketReleaseDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resultDeclarationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(['draft', 'scheduled', 'ongoing', 'completed', 'cancelled']),
    allowNull: false,
    defaultValue: 'draft'
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
  tableName: 'Exam',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['examId']
    },
    {
      fields: ['classId']
    },
    {
      fields: ['subjectId']
    },
    {
      fields: ['examType']
    },
    {
      fields: ['startDate']
    },
    {
      fields: ['status']
    },
    {
      fields: ['academicYear']
    }
  ]
});

// Generate exam ID
Exam.beforeCreate(async (exam) => {
  if (!exam.examId) {
    const year = new Date().getFullYear();
    const academicYear = exam.academicYear || `${year}-${year + 1}`;
    const count = await Exam.count({
      where: {
        academicYear: academicYear
      }
    });
    exam.examId = `EXAM-${year}-${String(count + 1).padStart(4, '0')}`;
  }
});

module.exports = Exam;