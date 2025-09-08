const { User, Student, Teacher } = require('../models');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Get all users with pagination and filtering
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    if (role && role !== 'all') {
      where.role = role;
    }

    if (status && status !== 'all') {
      where.isActive = status === 'active';
    }

    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] }, // Exclude password from response
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });

    // Get role statistics
    const roleStats = await User.findAll({
      attributes: [
        'role',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    res.json({
      status: 'success',
      data: {
        users: users.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalItems: users.count,
          itemsPerPage: parseInt(limit)
        },
        statistics: {
          totalUsers: users.count,
          roleBreakdown: roleStats
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch users' });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'admissionDate', 'classId'],
          required: false
        },
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'employeeId', 'specialization'],
          required: false
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user' });
  }
};

// Create new user
const createUser = async (req, res) => {
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
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      address,
      dateOfBirth,
      gender,
      profileImage,
      isActive = true,
      // Role-specific fields
      employeeId,
      specialization,
      studentId,
      admissionDate,
      classId,
      parentName,
      parentPhone,
      parentEmail
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // Validate and clean date fields
    let cleanDateOfBirth = dateOfBirth;
    if (dateOfBirth && (dateOfBirth === 'Invalid date' || dateOfBirth === '' || !Date.parse(dateOfBirth))) {
      cleanDateOfBirth = null;
    }

    let cleanAdmissionDate = admissionDate;
    if (admissionDate && (admissionDate === 'Invalid date' || admissionDate === '' || !Date.parse(admissionDate))) {
      cleanAdmissionDate = null;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      phone,
      address,
      dateOfBirth: cleanDateOfBirth,
      gender,
      profileImage,
      isActive
    });

    // Create role-specific record
    if (role === 'teacher' && employeeId) {
      await Teacher.create({
        userId: user.id,
        employeeId,
        specialization
      });
    } else if (role === 'student' && studentId) {
      await Student.create({
        userId: user.id,
        studentId,
        admissionDate: cleanAdmissionDate,
        classId,
        parentName,
        parentPhone,
        parentEmail
      });
    }
    // For other roles (clark, parent, staff, admin), no additional records are needed

    // Fetch created user with role-specific data
    const createdUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'admissionDate', 'classId'],
          required: false
        },
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'employeeId', 'specialization'],
          required: false
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: { user: createdUser }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create user' });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const {
      firstName,
      lastName,
      email,
      role,
      phone,
      address,
      dateOfBirth,
      gender,
      profileImage,
      isActive,
      // Role-specific fields
      employeeId,
      specialization,
      studentId,
      admissionDate,
      classId,
      parentName,
      parentPhone,
      parentEmail
    } = req.body;

    // Check if email is being changed and if it already exists
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }
    }

    // Validate and clean date fields
    let cleanDateOfBirth = dateOfBirth;
    if (dateOfBirth && (dateOfBirth === 'Invalid date' || dateOfBirth === '' || !Date.parse(dateOfBirth))) {
      cleanDateOfBirth = null;
    }

    let cleanAdmissionDate = admissionDate;
    if (admissionDate && (admissionDate === 'Invalid date' || admissionDate === '' || !Date.parse(admissionDate))) {
      cleanAdmissionDate = null;
    }

    // Update user
    await user.update({
      firstName,
      lastName,
      email,
      role,
      phone,
      address,
      dateOfBirth: cleanDateOfBirth,
      gender,
      profileImage,
      isActive
    });

    // Update role-specific record
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ where: { userId: user.id } });
      if (teacher) {
        await teacher.update({
          employeeId,
          specialization
        });
      } else if (employeeId) {
        await Teacher.create({
          userId: user.id,
          employeeId,
          specialization
        });
      }
    } else if (role === 'student') {
      const student = await Student.findOne({ where: { userId: user.id } });
      if (student) {
        await student.update({
          studentId,
          admissionDate: cleanAdmissionDate,
          classId,
          parentName,
          parentPhone,
          parentEmail
        });
      } else if (studentId) {
        await Student.create({
          userId: user.id,
          studentId,
          admissionDate: cleanAdmissionDate,
          classId,
          parentName,
          parentPhone,
          parentEmail
        });
      }
    }

    // Fetch updated user
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId', 'admissionDate', 'classId'],
          required: false
        },
        {
          model: Teacher,
          as: 'teacher',
          attributes: ['id', 'employeeId', 'specialization'],
          required: false
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update user' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Prevent deletion of the current user
    if (user.id === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete your own account'
      });
    }

    // Delete role-specific records first
    if (user.role === 'teacher') {
      await Teacher.destroy({ where: { userId: user.id } });
    } else if (user.role === 'student') {
      await Student.destroy({ where: { userId: user.id } });
    }

    // Delete user
    await user.destroy();

    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete user' });
  }
};

// Change user password
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password using raw query to avoid double hashing from hooks
    await sequelize.query(
      'UPDATE "User" SET password = :password, "updatedAt" = NOW() WHERE id = :id',
      {
        replacements: { password: hashedPassword, id: id },
        type: sequelize.QueryTypes.UPDATE
      }
    );

    res.json({
      status: 'success',
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ status: 'error', message: 'Failed to change password' });
  }
};

// Toggle user status (activate/deactivate)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Prevent deactivating your own account
    if (user.id === req.user.id) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot deactivate your own account'
      });
    }

    // Toggle status
    await user.update({ isActive: !user.isActive });

    res.json({
      status: 'success',
      message: `User ${user.isActive ? 'deactivated' : 'activated'} successfully`,
      data: { isActive: !user.isActive }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to toggle user status' });
  }
};

// Get user statistics
const getUserStatistics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const inactiveUsers = await User.count({ where: { isActive: false } });

    const roleStats = await User.findAll({
      attributes: [
        'role',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['role'],
      raw: true
    });

    const recentUsers = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'createdAt'],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      status: 'success',
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleBreakdown: roleStats,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch user statistics' });
  }
};

// Bulk create users
const bulkCreateUsers = async (req, res) => {
  try {
    const { users } = req.body;

    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Users array is required and must not be empty'
      });
    }

    const results = {
      successful: [],
      failed: []
    };

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ where: { email: userData.email } });
        if (existingUser) {
          results.failed.push({
            email: userData.email,
            error: 'User with this email already exists'
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 12);

        // Create user
        const user = await User.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          phone: userData.phone,
          address: userData.address,
          dateOfBirth: userData.dateOfBirth,
          gender: userData.gender,
          isActive: userData.isActive !== false
        });

        // Create role-specific record
        if (userData.role === 'teacher' && userData.employeeId) {
          await Teacher.create({
            userId: user.id,
            employeeId: userData.employeeId,
            specialization: userData.specialization
          });
        } else if (userData.role === 'student' && userData.studentId) {
          await Student.create({
            userId: user.id,
            studentId: userData.studentId,
            admissionDate: userData.admissionDate,
            classId: userData.classId,
            parentName: userData.parentName,
            parentPhone: userData.parentPhone,
            parentEmail: userData.parentEmail
          });
        }
        // For other roles (clark, parent, staff, admin), no additional records are needed

        results.successful.push({
          id: user.id,
          email: user.email,
          role: user.role
        });
      } catch (error) {
        results.failed.push({
          email: userData.email,
          error: error.message
        });
      }
    }

    res.json({
      status: 'success',
      message: `Bulk creation completed. ${results.successful.length} successful, ${results.failed.length} failed`,
      data: results
    });
  } catch (error) {
    console.error('Error in bulk user creation:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create users in bulk' });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword,
  toggleUserStatus,
  getUserStatistics,
  bulkCreateUsers
};
