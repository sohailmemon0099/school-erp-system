const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ClassTeacherAssignment = sequelize.define('ClassTeacherAssignment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Class',
        key: 'id'
      }
    },
    teacherId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    subjectId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional - for subject-specific assignments
      references: {
        model: 'Subject',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('class_teacher', 'subject_teacher'),
      allowNull: false,
      defaultValue: 'subject_teacher'
    },
    academicYear: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '2024-2025'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'User',
        key: 'id'
      }
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ClassTeacherAssignments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['classId', 'teacherId', 'subjectId', 'academicYear'],
        name: 'unique_class_teacher_subject_year'
      }
    ]
  });

  return ClassTeacherAssignment;
};
