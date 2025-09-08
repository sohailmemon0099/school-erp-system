const { ClassTeacherAssignment, User, Class, Subject } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// @desc    Get all class-teacher assignments
// @route   GET /api/class-teacher-assignments
// @access  Private (Admin)
const getClassTeacherAssignments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const academicYear = req.query.academicYear || '2024-2025';

    const whereClause = { academicYear };
    if (search) {
      whereClause[Op.or] = [
        { '$class.name$': { [Op.iLike]: `%${search}%` } },
        { '$teacher.firstName$': { [Op.iLike]: `%${search}%` } },
        { '$teacher.lastName$': { [Op.iLike]: `%${search}%` } },
        { '$subject.name$': { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: assignments } = await ClassTeacherAssignment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        },
        {
          model: User,
          as: 'assignedByUser',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        assignments,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get class-teacher assignments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching class-teacher assignments'
    });
  }
};

// @desc    Get assignments for a specific teacher
// @route   GET /api/class-teacher-assignments/teacher/:teacherId
// @access  Private (Admin, Teacher)
const getTeacherAssignments = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const academicYear = req.query.academicYear || '2024-2025';

    // If teacher is accessing their own assignments, verify they're the same user
    if (req.user.role === 'teacher' && req.user.id !== teacherId) {
      return res.status(403).json({
        status: 'error',
        message: 'Access denied. You can only view your own assignments.'
      });
    }

    const assignments = await ClassTeacherAssignment.findAll({
      where: { 
        teacherId, 
        academicYear,
        isActive: true 
      },
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { assignments }
    });
  } catch (error) {
    console.error('Get teacher assignments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching teacher assignments'
    });
  }
};

// @desc    Get assignments for a specific class
// @route   GET /api/class-teacher-assignments/class/:classId
// @access  Private (Admin)
const getClassAssignments = async (req, res) => {
  try {
    const { classId } = req.params;
    const academicYear = req.query.academicYear || '2024-2025';

    const assignments = await ClassTeacherAssignment.findAll({
      where: { 
        classId, 
        academicYear,
        isActive: true 
      },
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { assignments }
    });
  } catch (error) {
    console.error('Get class assignments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching class assignments'
    });
  }
};

// @desc    Create class-teacher assignment
// @route   POST /api/class-teacher-assignments
// @access  Private (Admin)
const createClassTeacherAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { classId, teacherId, subjectId, role, academicYear } = req.body;

    // Check if teacher exists and has teacher role
    const teacher = await User.findByPk(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid teacher ID or user is not a teacher'
      });
    }

    // Check if class exists
    const classExists = await Class.findByPk(classId);
    if (!classExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid class ID'
      });
    }

    // Check if subject exists (if provided)
    if (subjectId) {
      const subjectExists = await Subject.findByPk(subjectId);
      if (!subjectExists) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid subject ID'
        });
      }
    }

    // Check for existing assignment
    const existingAssignment = await ClassTeacherAssignment.findOne({
      where: {
        classId,
        teacherId,
        subjectId: subjectId || null,
        academicYear: academicYear || '2024-2025'
      }
    });

    if (existingAssignment) {
      return res.status(400).json({
        status: 'error',
        message: 'Assignment already exists for this teacher, class, and subject combination'
      });
    }

    const assignment = await ClassTeacherAssignment.create({
      classId,
      teacherId,
      subjectId: subjectId || null,
      role: role || 'subject_teacher',
      academicYear: academicYear || '2024-2025',
      assignedBy: req.user.id,
      isActive: true
    });

    // Fetch the created assignment with associations
    const createdAssignment = await ClassTeacherAssignment.findByPk(assignment.id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Class-teacher assignment created successfully',
      data: { assignment: createdAssignment }
    });
  } catch (error) {
    console.error('Create class-teacher assignment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating class-teacher assignment'
    });
  }
};

// @desc    Update class-teacher assignment
// @route   PUT /api/class-teacher-assignments/:id
// @access  Private (Admin)
const updateClassTeacherAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const assignment = await ClassTeacherAssignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Class-teacher assignment not found'
      });
    }

    const { role, isActive } = req.body;

    await assignment.update({
      role: role || assignment.role,
      isActive: isActive !== undefined ? isActive : assignment.isActive
    });

    // Fetch updated assignment with associations
    const updatedAssignment = await ClassTeacherAssignment.findByPk(assignment.id, {
      include: [
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code'],
          required: false
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Class-teacher assignment updated successfully',
      data: { assignment: updatedAssignment }
    });
  } catch (error) {
    console.error('Update class-teacher assignment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating class-teacher assignment'
    });
  }
};

// @desc    Delete class-teacher assignment
// @route   DELETE /api/class-teacher-assignments/:id
// @access  Private (Admin)
const deleteClassTeacherAssignment = async (req, res) => {
  try {
    const assignment = await ClassTeacherAssignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        status: 'error',
        message: 'Class-teacher assignment not found'
      });
    }

    await assignment.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Class-teacher assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete class-teacher assignment error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting class-teacher assignment'
    });
  }
};

// @desc    Bulk create class-teacher assignments
// @route   POST /api/class-teacher-assignments/bulk
// @access  Private (Admin)
const bulkCreateClassTeacherAssignments = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { assignments } = req.body;

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Assignments array is required and must not be empty'
      });
    }

    const createdAssignments = [];
    const bulkErrors = [];

    for (let i = 0; i < assignments.length; i++) {
      const { classId, teacherId, subjectId, role, academicYear } = assignments[i];

      try {
        // Check if teacher exists and has teacher role
        const teacher = await User.findByPk(teacherId);
        if (!teacher || teacher.role !== 'teacher') {
        bulkErrors.push({
          index: i,
          error: 'Invalid teacher ID or user is not a teacher'
        });
          continue;
        }

        // Check if class exists
        const classExists = await Class.findByPk(classId);
        if (!classExists) {
        bulkErrors.push({
          index: i,
          error: 'Invalid class ID'
        });
          continue;
        }

        // Check if subject exists (if provided)
        if (subjectId) {
          const subjectExists = await Subject.findByPk(subjectId);
          if (!subjectExists) {
          bulkErrors.push({
            index: i,
            error: 'Invalid subject ID'
          });
            continue;
          }
        }

        // Check for existing assignment
        const existingAssignment = await ClassTeacherAssignment.findOne({
          where: {
            classId,
            teacherId,
            subjectId: subjectId || null,
            academicYear: academicYear || '2024-2025'
          }
        });

        if (existingAssignment) {
          bulkErrors.push({
            index: i,
            error: 'Assignment already exists for this teacher, class, and subject combination'
          });
          continue;
        }

        const assignment = await ClassTeacherAssignment.create({
          classId,
          teacherId,
          subjectId: subjectId || null,
          role: role || 'subject_teacher',
          academicYear: academicYear || '2024-2025',
          assignedBy: req.user.id,
          isActive: true
        });

        createdAssignments.push(assignment);
      } catch (error) {
        bulkErrors.push({
          index: i,
          error: error.message
        });
      }
    }

    res.status(201).json({
      status: 'success',
      message: `Created ${createdAssignments.length} assignments successfully`,
      data: {
        createdAssignments,
        errors: bulkErrors.length > 0 ? bulkErrors : undefined
      }
    });
  } catch (error) {
    console.error('Bulk create class-teacher assignments error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating class-teacher assignments'
    });
  }
};

module.exports = {
  getClassTeacherAssignments,
  getTeacherAssignments,
  getClassAssignments,
  createClassTeacherAssignment,
  updateClassTeacherAssignment,
  deleteClassTeacherAssignment,
  bulkCreateClassTeacherAssignments
};
