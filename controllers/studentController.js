const { Student, User, Class, Grade, Attendance, Fee } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// @desc    Get all students
// @route   GET /api/students
// @access  Private (Admin, Teacher)
const getStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { studentId: { [Op.iLike]: `%${search}%` } },
        { parentName: { [Op.iLike]: `%${search}%` } },
        { parentPhone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: students } = await Student.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'profileImage']
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        }
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: {
        students,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalStudents: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching students'
    });
  }
};

// @desc    Get single student
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        }
      ]
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { student }
    });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching student'
    });
  }
};

// @desc    Create new student
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
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
      studentId,
      admissionDate,
      classId,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      medicalInfo,
      transportRoute
    } = req.body;

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ where: { studentId } });
    if (existingStudent) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID already exists'
      });
    }

    // Check if user already has a student record
    const existingUserStudent = await Student.findOne({ where: { userId } });
    if (existingUserStudent) {
      return res.status(400).json({
        status: 'error',
        message: 'User already has a student record'
      });
    }

    const student = await Student.create({
      userId,
      studentId,
      admissionDate,
      classId,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      medicalInfo,
      transportRoute
    });

    // Fetch the created student with associations
    const newStudent = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: { student: newStudent }
    });
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating student'
    });
  }
};

// @desc    Create new student with user data
// @route   POST /api/students/with-user
// @access  Private (Admin)
const createStudentWithUser = async (req, res) => {
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
      // Student fields
      studentId,
      admissionDate,
      classId,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      medicalInfo,
      transportRoute
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email already exists'
      });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ where: { studentId } });
    if (existingStudent) {
      return res.status(400).json({
        status: 'error',
        message: 'Student ID already exists'
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
      role: 'student',
      phone,
      address,
      dateOfBirth,
      gender,
      isActive: true
    });

    // Create student
    const student = await Student.create({
      userId: user.id,
      studentId,
      admissionDate,
      classId,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      medicalInfo,
      transportRoute,
      isActive: true
    });

    // Fetch the created student with associations
    const newStudent = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Student created successfully',
      data: { student: newStudent }
    });
  } catch (error) {
    console.error('Create student with user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating student'
    });
  }
};

// @desc    Update student
// @route   PUT /api/students/:id
// @access  Private (Admin)
const updateStudent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const {
      studentId,
      admissionDate,
      classId,
      parentName,
      parentPhone,
      parentEmail,
      emergencyContact,
      medicalInfo,
      transportRoute,
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

    // Check if student ID is being changed and if it already exists
    if (studentId && studentId !== student.studentId) {
      const existingStudent = await Student.findOne({ where: { studentId } });
      if (existingStudent) {
        return res.status(400).json({
          status: 'error',
          message: 'Student ID already exists'
        });
      }
    }

    // Update student record
    await student.update({
      studentId: studentId || student.studentId,
      admissionDate: admissionDate || student.admissionDate,
      classId: classId || student.classId,
      parentName: parentName || student.parentName,
      parentPhone: parentPhone || student.parentPhone,
      parentEmail: parentEmail || student.parentEmail,
      emergencyContact: emergencyContact || student.emergencyContact,
      medicalInfo: medicalInfo || student.medicalInfo,
      transportRoute: transportRoute || student.transportRoute,
      isActive: isActive !== undefined ? isActive : student.isActive
    });

    // Update associated user record if user fields are provided
    if (firstName || lastName || email || phone || address || dateOfBirth || gender) {
      const user = await User.findByPk(student.userId);
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

    // Fetch updated student with associations
    const updatedStudent = await Student.findByPk(student.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] }
        },
        {
          model: Class,
          as: 'class',
          attributes: ['id', 'name', 'section', 'academicYear']
        }
      ]
    });

    res.status(200).json({
      status: 'success',
      message: 'Student updated successfully',
      data: { student: updatedStudent }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating student'
    });
  }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (Admin)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    await student.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting student'
    });
  }
};

// @desc    Get student grades
// @route   GET /api/students/:id/grades
// @access  Private
const getStudentGrades = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const grades = await Grade.findAll({
      where: { studentId: req.params.id },
      include: [
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'name', 'code']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { grades }
    });
  } catch (error) {
    console.error('Get student grades error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching student grades'
    });
  }
};

// @desc    Get student attendance
// @route   GET /api/students/:id/attendance
// @access  Private
const getStudentAttendance = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const { startDate, endDate } = req.query;
    const whereClause = { studentId: req.params.id };

    if (startDate && endDate) {
      whereClause.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    const attendance = await Attendance.findAll({
      where: whereClause,
      include: [
        {
          model: Subject,
          attributes: ['id', 'name', 'code']
        },
        {
          model: Class,
          attributes: ['id', 'name', 'section']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { attendance }
    });
  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching student attendance'
    });
  }
};

// @desc    Get student fees
// @route   GET /api/students/:id/fees
// @access  Private
const getStudentFees = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const fees = await Fee.findAll({
      where: { studentId: req.params.id },
      order: [['dueDate', 'DESC']]
    });

    res.status(200).json({
      status: 'success',
      data: { fees }
    });
  } catch (error) {
    console.error('Get student fees error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching student fees'
    });
  }
};

// @desc    Get student statistics
// @route   GET /api/students/:id/stats
// @access  Private
const getStudentStats = async (req, res) => {
  try {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Get attendance statistics
    const totalAttendance = await Attendance.count({
      where: { studentId: req.params.id }
    });

    const presentCount = await Attendance.count({
      where: { 
        studentId: req.params.id,
        status: 'present'
      }
    });

    const attendancePercentage = totalAttendance > 0 ? (presentCount / totalAttendance) * 100 : 0;

    // Get grade statistics
    const grades = await Grade.findAll({
      where: { studentId: req.params.id }
    });

    const totalMarks = grades.reduce((sum, grade) => sum + grade.marks, 0);
    const totalMaxMarks = grades.reduce((sum, grade) => sum + grade.maxMarks, 0);
    const averagePercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : 0;

    // Get fee statistics
    const totalFees = await Fee.sum('amount', {
      where: { studentId: req.params.id }
    });

    const paidFees = await Fee.sum('amount', {
      where: { 
        studentId: req.params.id,
        status: 'paid'
      }
    });

    const pendingFees = totalFees - paidFees;

    res.status(200).json({
      status: 'success',
      data: {
        attendance: {
          total: totalAttendance,
          present: presentCount,
          percentage: Math.round(attendancePercentage * 100) / 100
        },
        grades: {
          total: grades.length,
          averagePercentage: Math.round(averagePercentage * 100) / 100
        },
        fees: {
          total: totalFees || 0,
          paid: paidFees || 0,
          pending: pendingFees || 0
        }
      }
    });
  } catch (error) {
    console.error('Get student stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching student statistics'
    });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  createStudentWithUser,
  updateStudent,
  deleteStudent,
  getStudentGrades,
  getStudentAttendance,
  getStudentFees,
  getStudentStats
};
