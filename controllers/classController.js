const { Class, Student, Teacher, Subject, User } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Get all classes
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { section: { [Op.iLike]: `%${search}%` } },
        { academicYear: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: classes } = await Class.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: Teacher,
          as: 'teachers',
          attributes: ['id', 'employeeId'],
          through: { attributes: [] },
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }
      ],
      limit,
      offset,
      order: [['name', 'ASC'], ['section', 'ASC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        classes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalClasses: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get classes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching classes'
    });
  }
};

// @desc    Get single class
// @route   GET /api/classes/:id
// @access  Private
const getClass = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id, {
      include: [
        {
          model: Student,
          as: 'students',
          attributes: ['id', 'studentId', 'admissionDate', 'isActive'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender']
          }]
        },
        {
          model: Teacher,
          as: 'teachers',
          attributes: ['id', 'employeeId', 'qualification', 'specialization'],
          through: { attributes: [] },
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'phone']
          }]
        }
      ]
    });

    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { class: classData }
    });
  } catch (error) {
    console.error('Get class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching class'
    });
  }
};

// @desc    Create new class
// @route   POST /api/classes
// @access  Private (Admin)
const createClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, section, capacity, academicYear, description } = req.body;

    // Check if class with same name and section already exists
    const existingClass = await Class.findOne({ 
      where: { 
        name, 
        section: section || null,
        academicYear 
      } 
    });
    
    if (existingClass) {
      return res.status(400).json({
        status: 'error',
        message: 'Class with this name, section and academic year already exists'
      });
    }

    const classData = await Class.create({
      name,
      section,
      capacity,
      academicYear,
      description
    });

    res.status(201).json({
      status: 'success',
      message: 'Class created successfully',
      data: { class: classData }
    });
  } catch (error) {
    console.error('Create class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating class'
    });
  }
};

// @desc    Update class
// @route   PUT /api/classes/:id
// @access  Private (Admin)
const updateClass = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const classData = await Class.findByPk(req.params.id);
    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }

    const { name, section, capacity, academicYear, description, isActive } = req.body;

    // Check if class with same name and section already exists (excluding current class)
    if (name || section || academicYear) {
      const existingClass = await Class.findOne({ 
        where: { 
          name: name || classData.name,
          section: section !== undefined ? section : classData.section,
          academicYear: academicYear || classData.academicYear,
          id: { [Op.ne]: req.params.id }
        } 
      });
      
      if (existingClass) {
        return res.status(400).json({
          status: 'error',
          message: 'Class with this name, section and academic year already exists'
        });
      }
    }

    await classData.update({
      name: name || classData.name,
      section: section !== undefined ? section : classData.section,
      capacity: capacity || classData.capacity,
      academicYear: academicYear || classData.academicYear,
      description: description || classData.description,
      isActive: isActive !== undefined ? isActive : classData.isActive
    });

    res.status(200).json({
      status: 'success',
      message: 'Class updated successfully',
      data: { class: classData }
    });
  } catch (error) {
    console.error('Update class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating class'
    });
  }
};

// @desc    Delete class
// @route   DELETE /api/classes/:id
// @access  Private (Admin)
const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id);
    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }

    // Check if class has students
    const studentCount = await Student.count({ where: { classId: req.params.id } });
    if (studentCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete class with existing students'
      });
    }

    await classData.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Class deleted successfully'
    });
  } catch (error) {
    console.error('Delete class error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting class'
    });
  }
};

// @desc    Get class statistics
// @route   GET /api/classes/:id/stats
// @access  Private
const getClassStats = async (req, res) => {
  try {
    const classData = await Class.findByPk(req.params.id);
    if (!classData) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }

    const studentCount = await Student.count({ 
      where: { 
        classId: req.params.id,
        isActive: true 
      } 
    });

    const teacherCount = await Teacher.count({
      include: [{
        model: Class,
        as: 'classes',
        where: { id: req.params.id },
        through: { attributes: [] }
      }]
    });

    const attendanceToday = await Attendance.count({
      where: {
        classId: req.params.id,
        date: new Date().toISOString().split('T')[0],
        status: 'present'
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalStudents: studentCount,
        totalTeachers: teacherCount,
        attendanceToday,
        capacity: classData.capacity,
        utilization: classData.capacity > 0 ? Math.round((studentCount / classData.capacity) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Get class stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching class statistics'
    });
  }
};

module.exports = {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getClassStats
};
