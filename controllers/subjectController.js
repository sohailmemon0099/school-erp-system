const { Subject, Teacher, Grade, Attendance, Class } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Private
const getSubjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: subjects } = await Subject.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section']
        }
      ],
      limit,
      offset,
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        subjects,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalSubjects: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching subjects'
    });
  }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id, {
      include: [
        {
          model: Teacher,
          as: 'teachers',
          attributes: ['id', 'employeeId', 'qualification', 'specialization'],
          through: { attributes: [] },
          include: [{
            model: User,
            attributes: ['firstName', 'lastName', 'email', 'phone']
          }]
        }
      ]
    });

    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { subject }
    });
  } catch (error) {
    console.error('Get subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching subject'
    });
  }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin)
const createSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, code, description, credits, classId, isActive } = req.body;

    // Check if subject code already exists
    const existingSubject = await Subject.findOne({ where: { code } });
    if (existingSubject) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject code already exists'
      });
    }

    const subject = await Subject.create({
      name,
      code,
      description,
      credits,
      classId,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      status: 'success',
      message: 'Subject created successfully',
      data: { subject }
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating subject'
    });
  }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin)
const updateSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    const { name, code, description, credits, isActive } = req.body;

    // Check if subject code is being changed and if it already exists
    if (code && code !== subject.code) {
      const existingSubject = await Subject.findOne({ where: { code } });
      if (existingSubject) {
        return res.status(400).json({
          status: 'error',
          message: 'Subject code already exists'
        });
      }
    }

    await subject.update({
      name: name || subject.name,
      code: code || subject.code,
      description: description || subject.description,
      credits: credits || subject.credits,
      isActive: isActive !== undefined ? isActive : subject.isActive
    });

    res.status(200).json({
      status: 'success',
      message: 'Subject updated successfully',
      data: { subject }
    });
  } catch (error) {
    console.error('Update subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating subject'
    });
  }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin)
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByPk(req.params.id);
    if (!subject) {
      return res.status(404).json({
        status: 'error',
        message: 'Subject not found'
      });
    }

    // Check if subject has grades or attendance records
    const gradeCount = await Grade.count({ where: { subjectId: req.params.id } });
    const attendanceCount = await Attendance.count({ where: { subjectId: req.params.id } });

    if (gradeCount > 0 || attendanceCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete subject with existing grades or attendance records'
      });
    }

    await subject.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Subject deleted successfully'
    });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting subject'
    });
  }
};

module.exports = {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
};
