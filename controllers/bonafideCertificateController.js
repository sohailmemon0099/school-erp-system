const { BonafideCertificate, Student, User, Class } = require('../models');
const { Op } = require('sequelize');

// Create a new bonafide certificate
const createBonafideCertificate = async (req, res) => {
  try {
    const {
      studentId,
      purpose,
      purposeDescription,
      issuedDate,
      validUntil,
      remarks
    } = req.body;

    // Check if student exists
    const student = await Student.findByPk(studentId, {
      include: [
        { model: User, as: 'user' },
        { model: Class, as: 'class' }
      ]
    });

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Check if student is active
    if (!student.isActive) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot issue certificate for inactive student'
      });
    }

    const certificate = await BonafideCertificate.create({
      studentId,
      purpose,
      purposeDescription,
      issuedDate: issuedDate || new Date(),
      validUntil,
      issuedBy: req.user.id,
      remarks
    });

    // Fetch the created certificate with associations
    const createdCertificate = await BonafideCertificate.findByPk(certificate.id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
        {
          model: User,
          as: 'issuedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Bonafide certificate created successfully',
      data: {
        certificate: createdCertificate
      }
    });
  } catch (error) {
    console.error('Error creating bonafide certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create bonafide certificate',
      error: error.message
    });
  }
};

// Get all bonafide certificates with pagination and filters
const getBonafideCertificates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      purpose,
      studentId,
      issuedBy,
      startDate,
      endDate,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    // Apply filters
    if (status) where.status = status;
    if (purpose) where.purpose = purpose;
    if (studentId) where.studentId = studentId;
    if (issuedBy) where.issuedBy = issuedBy;

    // Date range filter
    if (startDate || endDate) {
      where.issuedDate = {};
      if (startDate) where.issuedDate[Op.gte] = startDate;
      if (endDate) where.issuedDate[Op.lte] = endDate;
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { certificateNumber: { [Op.iLike]: `%${search}%` } },
        { purposeDescription: { [Op.iLike]: `%${search}%` } },
        { remarks: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: certificates } = await BonafideCertificate.findAndCountAll({
      where,
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
        {
          model: User,
          as: 'issuedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        certificates,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching bonafide certificates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bonafide certificates',
      error: error.message
    });
  }
};

// Get bonafide certificate by ID
const getBonafideCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await BonafideCertificate.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
        {
          model: User,
          as: 'issuedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Bonafide certificate not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        certificate
      }
    });
  } catch (error) {
    console.error('Error fetching bonafide certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch bonafide certificate',
      error: error.message
    });
  }
};

// Update bonafide certificate
const updateBonafideCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      purpose,
      purposeDescription,
      issuedDate,
      validUntil,
      status,
      remarks
    } = req.body;

    const certificate = await BonafideCertificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Bonafide certificate not found'
      });
    }

    // Check if certificate can be updated
    if (certificate.status === 'issued' && status !== 'issued') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot modify issued certificate'
      });
    }

    await certificate.update({
      purpose,
      purposeDescription,
      issuedDate,
      validUntil,
      status,
      remarks
    });

    // Fetch updated certificate with associations
    const updatedCertificate = await BonafideCertificate.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
        {
          model: User,
          as: 'issuedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Bonafide certificate updated successfully',
      data: {
        certificate: updatedCertificate
      }
    });
  } catch (error) {
    console.error('Error updating bonafide certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update bonafide certificate',
      error: error.message
    });
  }
};

// Delete bonafide certificate
const deleteBonafideCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await BonafideCertificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Bonafide certificate not found'
      });
    }

    // Check if certificate can be deleted
    if (certificate.status === 'issued') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot delete issued certificate'
      });
    }

    await certificate.destroy();

    res.json({
      status: 'success',
      message: 'Bonafide certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bonafide certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete bonafide certificate',
      error: error.message
    });
  }
};

// Issue bonafide certificate
const issueBonafideCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await BonafideCertificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Bonafide certificate not found'
      });
    }

    if (certificate.status === 'issued') {
      return res.status(400).json({
        status: 'error',
        message: 'Certificate is already issued'
      });
    }

    await certificate.update({
      status: 'issued',
      issuedDate: new Date()
    });

    // Fetch updated certificate with associations
    const issuedCertificate = await BonafideCertificate.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            { model: User, as: 'user' },
            { model: Class, as: 'class' }
          ]
        },
        {
          model: User,
          as: 'issuedByUser',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Bonafide certificate issued successfully',
      data: {
        certificate: issuedCertificate
      }
    });
  } catch (error) {
    console.error('Error issuing bonafide certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to issue bonafide certificate',
      error: error.message
    });
  }
};

// Get certificate statistics
const getCertificateStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01`);
    const endOfYear = new Date(`${currentYear}-12-31`);

    const stats = await BonafideCertificate.findAll({
      where: {
        issuedDate: {
          [Op.gte]: startOfYear,
          [Op.lte]: endOfYear
        }
      },
      attributes: [
        'purpose',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['purpose'],
      raw: true
    });

    const totalCertificates = await BonafideCertificate.count({
      where: {
        issuedDate: {
          [Op.gte]: startOfYear,
          [Op.lte]: endOfYear
        }
      }
    });

    const issuedCertificates = await BonafideCertificate.count({
      where: {
        status: 'issued',
        issuedDate: {
          [Op.gte]: startOfYear,
          [Op.lte]: endOfYear
        }
      }
    });

    res.json({
      status: 'success',
      data: {
        totalCertificates,
        issuedCertificates,
        pendingCertificates: totalCertificates - issuedCertificates,
        purposeBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching certificate stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch certificate statistics',
      error: error.message
    });
  }
};

module.exports = {
  createBonafideCertificate,
  getBonafideCertificates,
  getBonafideCertificateById,
  updateBonafideCertificate,
  deleteBonafideCertificate,
  issueBonafideCertificate,
  getCertificateStats
};
