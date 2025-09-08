const { LeavingCertificate, Student, User, Class } = require('../models');
const { Op } = require('sequelize');

// Create a new leaving certificate
const createLeavingCertificate = async (req, res) => {
  try {
    const {
      studentId,
      leavingDate,
      reasonForLeaving,
      reasonDescription,
      lastClassAttended,
      academicYear,
      conduct,
      attendancePercentage,
      feesPaid,
      libraryBooksReturned,
      noDuesCertificate,
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

    // Check if student already has a leaving certificate
    const existingCertificate = await LeavingCertificate.findOne({
      where: { studentId, status: { [Op.ne]: 'cancelled' } }
    });

    if (existingCertificate) {
      return res.status(400).json({
        status: 'error',
        message: 'Student already has a leaving certificate'
      });
    }

    const certificate = await LeavingCertificate.create({
      studentId,
      leavingDate,
      reasonForLeaving,
      reasonDescription,
      lastClassAttended,
      academicYear,
      conduct,
      attendancePercentage,
      feesPaid,
      libraryBooksReturned,
      noDuesCertificate,
      issuedBy: req.user.id,
      remarks
    });

    // Fetch the created certificate with associations
    const createdCertificate = await LeavingCertificate.findByPk(certificate.id, {
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
      message: 'Leaving certificate created successfully',
      data: {
        certificate: createdCertificate
      }
    });
  } catch (error) {
    console.error('Error creating leaving certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create leaving certificate',
      error: error.message
    });
  }
};

// Get all leaving certificates with pagination and filters
const getLeavingCertificates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      reasonForLeaving,
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
    if (reasonForLeaving) where.reasonForLeaving = reasonForLeaving;
    if (studentId) where.studentId = studentId;
    if (issuedBy) where.issuedBy = issuedBy;

    // Date range filter
    if (startDate || endDate) {
      where.leavingDate = {};
      if (startDate) where.leavingDate[Op.gte] = startDate;
      if (endDate) where.leavingDate[Op.lte] = endDate;
    }

    // Search filter
    if (search) {
      where[Op.or] = [
        { certificateNumber: { [Op.iLike]: `%${search}%` } },
        { reasonDescription: { [Op.iLike]: `%${search}%` } },
        { remarks: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: certificates } = await LeavingCertificate.findAndCountAll({
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
    console.error('Error fetching leaving certificates:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaving certificates',
      error: error.message
    });
  }
};

// Get leaving certificate by ID
const getLeavingCertificateById = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await LeavingCertificate.findByPk(id, {
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
        message: 'Leaving certificate not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        certificate
      }
    });
  } catch (error) {
    console.error('Error fetching leaving certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch leaving certificate',
      error: error.message
    });
  }
};

// Update leaving certificate
const updateLeavingCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      leavingDate,
      reasonForLeaving,
      reasonDescription,
      lastClassAttended,
      academicYear,
      conduct,
      attendancePercentage,
      feesPaid,
      libraryBooksReturned,
      noDuesCertificate,
      status,
      remarks
    } = req.body;

    const certificate = await LeavingCertificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Leaving certificate not found'
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
      leavingDate,
      reasonForLeaving,
      reasonDescription,
      lastClassAttended,
      academicYear,
      conduct,
      attendancePercentage,
      feesPaid,
      libraryBooksReturned,
      noDuesCertificate,
      status,
      remarks
    });

    // Fetch updated certificate with associations
    const updatedCertificate = await LeavingCertificate.findByPk(id, {
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
      message: 'Leaving certificate updated successfully',
      data: {
        certificate: updatedCertificate
      }
    });
  } catch (error) {
    console.error('Error updating leaving certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update leaving certificate',
      error: error.message
    });
  }
};

// Delete leaving certificate
const deleteLeavingCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await LeavingCertificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Leaving certificate not found'
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
      message: 'Leaving certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting leaving certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete leaving certificate',
      error: error.message
    });
  }
};

// Issue leaving certificate
const issueLeavingCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await LeavingCertificate.findByPk(id);

    if (!certificate) {
      return res.status(404).json({
        status: 'error',
        message: 'Leaving certificate not found'
      });
    }

    if (certificate.status === 'issued') {
      return res.status(400).json({
        status: 'error',
        message: 'Certificate is already issued'
      });
    }

    // Check if all requirements are met
    if (!certificate.feesPaid || !certificate.libraryBooksReturned || !certificate.noDuesCertificate) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot issue certificate. Please ensure all requirements are met (fees paid, library books returned, no dues certificate)'
      });
    }

    await certificate.update({
      status: 'issued',
      issuedDate: new Date()
    });

    // Fetch updated certificate with associations
    const issuedCertificate = await LeavingCertificate.findByPk(id, {
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
      message: 'Leaving certificate issued successfully',
      data: {
        certificate: issuedCertificate
      }
    });
  } catch (error) {
    console.error('Error issuing leaving certificate:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to issue leaving certificate',
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

    const stats = await LeavingCertificate.findAll({
      where: {
        leavingDate: {
          [Op.gte]: startOfYear,
          [Op.lte]: endOfYear
        }
      },
      attributes: [
        'reasonForLeaving',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['reasonForLeaving'],
      raw: true
    });

    const totalCertificates = await LeavingCertificate.count({
      where: {
        leavingDate: {
          [Op.gte]: startOfYear,
          [Op.lte]: endOfYear
        }
      }
    });

    const issuedCertificates = await LeavingCertificate.count({
      where: {
        status: 'issued',
        leavingDate: {
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
        reasonBreakdown: stats
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
  createLeavingCertificate,
  getLeavingCertificates,
  getLeavingCertificateById,
  updateLeavingCertificate,
  deleteLeavingCertificate,
  issueLeavingCertificate,
  getCertificateStats
};
