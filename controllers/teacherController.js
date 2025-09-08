const { Teacher, User, Class, Subject } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private (Admin)
const getTeachers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { employeeId: { [Op.iLike]: `%${search}%` } },
        { qualification: { [Op.iLike]: `%${search}%` } },
        { specialization: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: teachers } = await Teacher.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'profileImage']
        },
        {
          model: Class,
          as: 'classes',
          attributes: ['id', 'name', 'section'],
          through: { attributes: [] }
        },
        {
          model: Subject,
          as: 'subjects',
          attributes: ['id', 'name', 'code'],
          through: { attributes: [] }
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        teachers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalTeachers: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching teachers'
    });
  }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Private
const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'classes',
          attributes: ['id', 'name', 'section', 'academicYear'],
          through: { attributes: [] }
        },
        {
          model: Subject,
          as: 'subjects',
          attributes: ['id', 'name', 'code', 'description'],
          through: { attributes: [] }
        }
      ]
    });

    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { teacher }
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching teacher'
    });
  }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin)
const createTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      userId,
      employeeId,
      hireDate,
      qualification,
      specialization,
      salary,
      isActive
    } = req.body;

    // Check if employee ID already exists
    const existingTeacher = await Teacher.findOne({ where: { employeeId } });
    if (existingTeacher) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID already exists'
      });
    }

    // Check if user already has a teacher record
    const existingUserTeacher = await Teacher.findOne({ where: { userId } });
    if (existingUserTeacher) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has a teacher record'
      });
    }

    const teacher = await Teacher.create({
      userId,
      employeeId,
      hireDate,
      qualification,
      specialization,
      salary,
      isActive: isActive !== undefined ? isActive : true
    });

    // Fetch the created teacher with associations
    const newTeacher = await Teacher.findByPk(teacher.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Teacher created successfully',
      data: { teacher: newTeacher }
    });
  } catch (error) {
    console.error('Create teacher error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating teacher'
    });
  }
};

// @desc    Create new teacher with user data
// @route   POST /api/teachers/with-user
// @access  Private (Admin)
const createTeacherWithUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      // User fields
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      dateOfBirth,
      gender,
      // Teacher fields
      employeeId,
      hireDate,
      qualification,
      specialization,
      salary
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }

    // Check if employee ID already exists
    const existingTeacher = await Teacher.findOne({ where: { employeeId } });
    if (existingTeacher) {
      return res.status(400).json({
        status: 'error',
        message: 'Employee ID already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: 'teacher',
      phone,
      address,
      dateOfBirth,
      gender,
      isActive: true
    });

    // Create teacher
    const teacher = await Teacher.create({
      userId: user.id,
      employeeId,
      hireDate,
      qualification,
      specialization,
      salary,
      isActive: true
    });

    // Fetch the created teacher with associations
    const newTeacher = await Teacher.findByPk(teacher.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Teacher created successfully',
      data: { teacher: newTeacher }
    });
  } catch (error) {
    console.error('Create teacher with user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating teacher'
    });
  }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin)
const updateTeacher = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    const {
      employeeId,
      hireDate,
      qualification,
      specialization,
      salary,
      isActive,
      // User fields
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth,
      gender
    } = req.body;

    // Check if employee ID is being changed and if it already exists
    if (employeeId && employeeId !== teacher.employeeId) {
      const existingTeacher = await Teacher.findOne({ where: { employeeId } });
      if (existingTeacher) {
        return res.status(400).json({
          status: 'error',
          message: 'Employee ID already exists'
        });
      }
    }

    // Update teacher record
    await teacher.update({
      employeeId: employeeId || teacher.employeeId,
      hireDate: hireDate || teacher.hireDate,
      qualification: qualification || teacher.qualification,
      specialization: specialization || teacher.specialization,
      salary: salary || teacher.salary,
      isActive: isActive !== undefined ? isActive : teacher.isActive
    });

    // Update associated user record if user fields are provided
    if (firstName || lastName || email || phone || address || dateOfBirth || gender) {
      const user = await User.findByPk(teacher.userId);
      if (user) {
        await user.update({
          firstName: firstName || user.firstName,
          lastName: lastName || user.lastName,
          email: email || user.email,
          phone: phone || user.phone,
          address: address || user.address,
          dateOfBirth: dateOfBirth || user.dateOfBirth,
          gender: gender || user.gender
        });
      }
    }

    // Fetch updated teacher with associations
    const updatedTeacher = await Teacher.findByPk(teacher.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'classes',
          attributes: ['id', 'name', 'section'],
          through: { attributes: [] }
        },
        {
          model: Subject,
          as: 'subjects',
          attributes: ['id', 'name', 'code'],
          through: { attributes: [] }
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Teacher updated successfully',
      data: { teacher: updatedTeacher }
    });
  } catch (error) {
    console.error('Update teacher error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating teacher'
    });
  }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin)
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    await teacher.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Teacher deleted successfully'
    });
  } catch (error) {
    console.error('Delete teacher error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting teacher'
    });
  }
};

// @desc    Assign teacher to classes
// @route   POST /api/teachers/:id/assign-classes
// @access  Private (Admin)
const assignClasses = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    const { classIds } = req.body;

    if (!Array.isArray(classIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'Class IDs must be an array'
      });
    }

    // Verify all classes exist
    const classes = await Class.findAll({ where: { id: classIds } });
    if (classes.length !== classIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more classes not found'
      });
    }

    await teacher.setClasses(classIds);

    res.status(200).json({
      status: 'success',
      message: 'Classes assigned successfully'
    });
  } catch (error) {
    console.error('Assign classes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while assigning classes'
    });
  }
};

// @desc    Assign teacher to subjects
// @route   POST /api/teachers/:id/assign-subjects
// @access  Private (Admin)
const assignSubjects = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: 'Teacher not found'
      });
    }

    const { subjectIds } = req.body;

    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({
        status: 'error',
        message: 'Subject IDs must be an array'
      });
    }

    // Verify all subjects exist
    const subjects = await Subject.findAll({ where: { id: subjectIds } });
    if (subjects.length !== subjectIds.length) {
      return res.status(400).json({
        status: 'error',
        message: 'One or more subjects not found'
      });
    }

    await teacher.setSubjects(subjectIds);

    res.status(200).json({
      status: 'success',
      message: 'Subjects assigned successfully'
    });
  } catch (error) {
    console.error('Assign subjects error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while assigning subjects'
    });
  }
};

module.exports = {
  getTeachers,
  getTeacher,
  createTeacher,
  createTeacherWithUser,
  updateTeacher,
  deleteTeacher,
  assignClasses,
  assignSubjects
};
