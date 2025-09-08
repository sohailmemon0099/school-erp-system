const { Inquiries, User } = require('../models');
const { Op } = require('sequelize');

// Admission Enquiry Management
const getInquiries = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', source = '', classId = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { studentName: { [Op.iLike]: `%${search}%` } },
        { parentName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (source) {
      whereClause.inquirySource = source;
    }
    if (classId) {
      whereClause.preferredClass = classId;
    }

    const { count, rows: inquiries } = await Inquiries.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: inquiries,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiries.create(req.body);
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Inquiries.update(req.body, { where: { id } });
    
    if (updated) {
      const inquiry = await Inquiries.findByPk(id);
      res.json({ success: true, data: inquiry });
    } else {
      res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Inquiries.destroy({ where: { id } });
    
    if (deleted) {
      res.json({ success: true, message: 'Inquiry deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Inquiry not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Follow-up Management
const getFollowUps = async (req, res) => {
  try {
    const { page = 1, limit = 10, inquiryId = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (inquiryId) {
      whereClause.inquiryId = inquiryId;
    }
    if (status) {
      whereClause.status = status;
    }

    // Mock follow-up data since we don't have a FollowUp model yet
    const followUps = [
      {
        id: 'followup_1',
        inquiryId: 'inquiry_1',
        date: new Date('2024-01-15'),
        type: 'phone_call',
        notes: 'Called parent to discuss admission process',
        status: 'completed',
        nextFollowUpDate: new Date('2024-01-22'),
        assignedTo: 'admin_1'
      },
      {
        id: 'followup_2',
        inquiryId: 'inquiry_2',
        date: new Date('2024-01-20'),
        type: 'email',
        notes: 'Sent admission brochure via email',
        status: 'pending',
        nextFollowUpDate: new Date('2024-01-27'),
        assignedTo: 'admin_2'
      }
    ];

    res.json({
      success: true,
      data: followUps,
      pagination: {
        total: followUps.length,
        page: parseInt(page),
        pages: Math.ceil(followUps.length / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createFollowUp = async (req, res) => {
  try {
    const followUp = {
      id: `followup_${Date.now()}`,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    res.status(201).json({ success: true, data: followUp });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admission Funnel Reports
const getAdmissionFunnelReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Mock funnel data
    const funnelData = {
      totalInquiries: 150,
      qualifiedLeads: 120,
      applications: 80,
      admissions: 45,
      conversionRates: {
        inquiryToQualified: 80,
        qualifiedToApplication: 66.7,
        applicationToAdmission: 56.25,
        overallConversion: 30
      },
      monthlyTrends: [
        { month: 'Jan', inquiries: 25, admissions: 8 },
        { month: 'Feb', inquiries: 30, admissions: 10 },
        { month: 'Mar', inquiries: 35, admissions: 12 },
        { month: 'Apr', inquiries: 28, admissions: 9 },
        { month: 'May', inquiries: 32, admissions: 6 }
      ]
    };

    res.json({ success: true, data: funnelData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Inquiry Management
  getInquiries,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  
  // Follow-up Management
  getFollowUps,
  createFollowUp,
  
  // Reports
  getAdmissionFunnelReport
};
