const { Inquiry, Student, User, Class } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const smsService = require('../services/smsService');

// @desc    Get all inquiries
// @route   GET /api/inquiries
// @access  Private (Admin, Staff)
const getInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { inquiryId: { [Op.iLike]: `%${search}%` } },
        { studentFirstName: { [Op.iLike]: `%${search}%` } },
        { studentLastName: { [Op.iLike]: `%${search}%` } },
        { parentFirstName: { [Op.iLike]: `%${search}%` } },
        { parentLastName: { [Op.iLike]: `%${search}%` } },
        { parentPhone: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: inquiries } = await Inquiry.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      status: 'success',
      data: {
        inquiries,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalInquiries: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get inquiries error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching inquiries'
    });
  }
};

// @desc    Get single inquiry
// @route   GET /api/inquiries/:id
// @access  Private
const getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);

    if (!inquiry) {
      return res.status(404).json({
        status: 'error',
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Get inquiry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching inquiry'
    });
  }
};

// @desc    Get inquiry by inquiry ID
// @route   GET /api/inquiries/lookup/:inquiryId
// @access  Private
const getInquiryByInquiryId = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      where: { inquiryId: req.params.inquiryId }
    });

    if (!inquiry) {
      return res.status(404).json({
        status: 'error',
        message: 'Inquiry not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Get inquiry by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching inquiry'
    });
  }
};

// @desc    Create new inquiry
// @route   POST /api/inquiries
// @access  Private (Admin, Staff)
const createInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inquiryData = req.body;
    
    // Generate automatic inquiry ID
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get count of inquiries for this month
    const count = await Inquiry.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(year, new Date().getMonth(), 1),
          [Op.lt]: new Date(year, new Date().getMonth() + 1, 1)
        }
      }
    });
    
    // Generate ID: INQ-YYYY-MM-XXXX
    const inquiryNumber = String(count + 1).padStart(4, '0');
    inquiryData.inquiryId = `INQ-${year}-${month}-${inquiryNumber}`;
    
    const inquiry = await Inquiry.create(inquiryData);

    // Send SMS/WhatsApp notification
    try {
      await sendInquiryNotification(inquiry);
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
      // Don't fail the inquiry creation if notification fails
    }

    res.status(201).json({
      status: 'success',
      message: 'Inquiry created successfully',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating inquiry'
    });
  }
};

// @desc    Update inquiry
// @route   PUT /api/inquiries/:id
// @access  Private (Admin, Staff)
const updateInquiry = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        status: 'error',
        message: 'Inquiry not found'
      });
    }

    await inquiry.update(req.body);

    res.status(200).json({
      status: 'success',
      message: 'Inquiry updated successfully',
      data: { inquiry }
    });
  } catch (error) {
    console.error('Update inquiry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating inquiry'
    });
  }
};

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin)
const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        status: 'error',
        message: 'Inquiry not found'
      });
    }

    await inquiry.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting inquiry'
    });
  }
};

// @desc    Convert inquiry to student
// @route   POST /api/inquiries/:id/convert-to-student
// @access  Private (Admin)
const convertInquiryToStudent = async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) {
      return res.status(404).json({
        status: 'error',
        message: 'Inquiry not found'
      });
    }

    if (inquiry.admissionConfirmed) {
      return res.status(400).json({
        status: 'error',
        message: 'Inquiry already converted to student'
      });
    }

    // Create user account
    const user = await User.create({
      firstName: inquiry.studentFirstName,
      lastName: inquiry.studentLastName,
      email: inquiry.parentEmail || `${inquiry.inquiryId}@temp.com`,
      password: await bcrypt.hash('password123', 10),
      role: 'student',
      phone: inquiry.parentPhone,
      address: inquiry.parentAddress,
      dateOfBirth: inquiry.studentDateOfBirth,
      gender: inquiry.studentGender,
      isActive: true
    });

    // Create student record
    const student = await Student.create({
      userId: user.id,
      studentId: `STU${inquiry.inquiryId.replace('INQ-', '')}`,
      admissionDate: new Date().toISOString().split('T')[0],
      classId: req.body.classId, // Should be provided in request
      parentName: `${inquiry.parentFirstName} ${inquiry.parentLastName}`,
      parentPhone: inquiry.parentPhone,
      parentEmail: inquiry.parentEmail,
      emergencyContact: inquiry.emergencyContactName,
      medicalInfo: inquiry.studentBloodGroup,
      transportRoute: req.body.transportRoute || null,
      isActive: true
    });

    // Update inquiry
    await inquiry.update({
      admissionConfirmed: true,
      admissionDate: new Date(),
      studentId: student.id,
      status: 'admitted'
    });

    res.status(201).json({
      status: 'success',
      message: 'Inquiry converted to student successfully',
      data: { 
        inquiry,
        student: {
          id: student.id,
          studentId: student.studentId,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          }
        }
      }
    });
  } catch (error) {
    console.error('Convert inquiry to student error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while converting inquiry to student'
    });
  }
};

// @desc    Get inquiry statistics
// @route   GET /api/inquiries/stats
// @access  Private (Admin)
const getInquiryStats = async (req, res) => {
  try {
    const totalInquiries = await Inquiry.count();
    const newInquiries = await Inquiry.count({ where: { status: 'new' } });
    const contactedInquiries = await Inquiry.count({ where: { status: 'contacted' } });
    const admittedInquiries = await Inquiry.count({ where: { status: 'admitted' } });
    
    // Monthly statistics
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthlyInquiries = await Inquiry.count({
      where: {
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    res.status(200).json({
      status: 'success',
      data: {
        totalInquiries,
        newInquiries,
        contactedInquiries,
        admittedInquiries,
        monthlyInquiries
      }
    });
  } catch (error) {
    console.error('Get inquiry stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching inquiry statistics'
    });
  }
};

// Helper function to send inquiry notification
const sendInquiryNotification = async (inquiry) => {
  try {
    // Send real SMS using the SMS service
    const smsResult = await smsService.sendInquiryConfirmation(inquiry);
    
    if (smsResult.success) {
      console.log(`✅ SMS sent successfully to ${inquiry.parentPhone}. Message ID: ${smsResult.messageId}`);
      
      // Update notification status
      await inquiry.update({
        smsSent: true,
        whatsappSent: true
      });
    } else {
      console.error(`❌ SMS failed to ${inquiry.parentPhone}:`, smsResult.error);
      
      // Still update as attempted (you might want to retry later)
      await inquiry.update({
        smsSent: false,
        whatsappSent: false
      });
    }
    
    return smsResult.success;
  } catch (error) {
    console.error('SMS notification error:', error.message);
    
    // Update as failed
    await inquiry.update({
      smsSent: false,
      whatsappSent: false
    });
    
    return false;
  }
};

module.exports = {
  getInquiries,
  getInquiry,
  getInquiryByInquiryId,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  convertInquiryToStudent,
  getInquiryStats
};
