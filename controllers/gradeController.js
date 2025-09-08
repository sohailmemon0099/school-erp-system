const { Grade, Student, Subject, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Get all grades
// @route   GET /api/grades
// @access  Private
const getGrades = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { studentId, subjectId, examType } = req.query;

    const whereClause = {};
    
    if (studentId) whereClause.studentId = studentId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (examType) whereClause.examType = { [Op.iLike]: `%${examType}%` };

    const { count, rows: grades } = await Grade.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ],
      limit,
      offset,
      order: [['examDate', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        grades,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalRecords: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching grades'
    });
  }
};

// @desc    Get single grade
// @route   GET /api/grades/:id
// @access  Private
const getGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code', 'description']
        }
      ]
    });

    if (!grade) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade record not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { grade }
    });
  } catch (error) {
    console.error('Get grade error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching grade'
    });
  }
};

// @desc    Create grade
// @route   POST /api/grades
// @access  Private (Teacher, Admin)
const createGrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId, subjectId, examType, marks, maxMarks, examDate, remarks, grade: gradeLetter } = req.body;

    const grade = await Grade.create({
      studentId,
      subjectId,
      examType,
      examName: `${examType} Exam`, // Default exam name
      marksObtained: parseFloat(marks),
      totalMarks: parseFloat(maxMarks),
      examDate: examDate || new Date().toISOString().split('T')[0],
      remarks,
      academicYear: '2024-2025', // Default academic year
      grade: gradeLetter
    });

    // Fetch the created grade with associations
    const newGrade = await Grade.findByPk(grade.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Grade recorded successfully',
      data: { grade: newGrade }
    });
  } catch (error) {
    console.error('Create grade error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating grade'
    });
  }
};

// @desc    Update grade
// @route   PUT /api/grades/:id
// @access  Private (Teacher, Admin)
const updateGrade = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade record not found'
      });
    }

    const { examType, marks, maxMarks, examDate, remarks, grade: gradeLetter } = req.body;

    await grade.update({
      examType: examType || grade.examType,
      marksObtained: marks !== undefined ? parseFloat(marks) : grade.marksObtained,
      totalMarks: maxMarks !== undefined ? parseFloat(maxMarks) : grade.totalMarks,
      examDate: examDate || grade.examDate,
      remarks: remarks || grade.remarks,
      grade: gradeLetter || grade.grade
    });

    // Fetch updated grade with associations
    const updatedGrade = await Grade.findByPk(grade.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Grade updated successfully',
      data: { grade: updatedGrade }
    });
  } catch (error) {
    console.error('Update grade error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating grade'
    });
  }
};

// @desc    Delete grade
// @route   DELETE /api/grades/:id
// @access  Private (Admin)
const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json({
        status: 'error',
        message: 'Grade record not found'
      });
    }

    await grade.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Delete grade error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting grade'
    });
  }
};

// @desc    Get grade statistics
// @route   GET /api/grades/stats
// @access  Private
const getGradeStats = async (req, res) => {
  try {
    const { studentId, subjectId, classId, examType } = req.query;

    const whereClause = {};
    if (studentId) whereClause.studentId = studentId;
    if (subjectId) whereClause.subjectId = subjectId;
    if (examType) whereClause.examType = examType;

    // If classId is provided, we need to join with Student table
    let includeClause = [];
    if (classId) {
      includeClause = [{
        model: Student,
        as: 'student',
        where: { classId },
        attributes: []
      }];
    }

    const grades = await Grade.findAll({
      where: whereClause,
      include: includeClause
    });

    if (grades.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          totalGrades: 0,
          averagePercentage: 0,
          highestMarks: 0,
          lowestMarks: 0,
          gradeDistribution: {}
        }
      });
    }

    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
    const totalMaxMarks = grades.reduce((sum, grade) => sum + grade.maxMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

    const marksArray = grades.map(grade => grade.marks);
    const highestMarks = Math.max(...marksArray);
    const lowestMarks = Math.min(...marksArray);

    // Grade distribution
    const gradeDistribution = grades.reduce((acc, grade) => {
      const percentage = (grade.marks / grade.maxMarks) * 100;
      let gradeLetter;
      
      if (percentage >= 90) gradeLetter = 'A+';
      else if (percentage >= 80) gradeLetter = 'A';
      else if (percentage >= 70) gradeLetter = 'B+';
      else if (percentage >= 60) gradeLetter = 'B';
      else if (percentage >= 50) gradeLetter = 'C+';
      else if (percentage >= 40) gradeLetter = 'C';
      else gradeLetter = 'F';

      acc[gradeLetter] = (acc[gradeLetter] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      status: 'success',
      data: {
        totalGrades: grades.length,
        averagePercentage: Math.round(averagePercentage * 100) / 100,
        highestMarks,
        lowestMarks,
        gradeDistribution
      }
    });
  } catch (error) {
    console.error('Get grade stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching grade statistics'
    });
  }
};

module.exports = {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeStats
};
