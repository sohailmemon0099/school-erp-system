const Affidavit = require('../models/Affidavit');
const Student = require('../models/Student');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get all affidavits
const getAllAffidavits = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { affidavitId: { [Op.iLike]: `%${search}%` } },
        { title: { [Op.iLike]: `%${search}%` } },
        { documentNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    const affidavits = await Affidavit.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        affidavits: affidavits.rows,
        totalCount: affidavits.count,
        totalPages: Math.ceil(affidavits.count / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    console.error('Error fetching affidavits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch affidavits'
    });
  }
};

// Get affidavit by ID
const getAffidavitById = async (req, res) => {
  try {
    const { id } = req.params;

    const affidavit = await Affidavit.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email', 'phone']
            }
          ]
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    if (!affidavit) {
      return res.status(404).json({
        status: 'error',
        message: 'Affidavit not found'
      });
    }

    res.json({
      status: 'success',
      data: { affidavit }
    });
  } catch (error) {
    console.error('Error fetching affidavit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch affidavit'
    });
  }
};

// Create new affidavit
const createAffidavit = async (req, res) => {
  try {
    const {
      studentId,
      type,
      title,
      description,
      issuedBy,
      issuedDate,
      validUntil,
      documentNumber,
      remarks
    } = req.body;

    // Check if student exists
    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    const affidavit = await Affidavit.create({
      studentId,
      type,
      title,
      description,
      issuedBy,
      issuedDate,
      validUntil,
      documentNumber,
      remarks
    });

    const newAffidavit = await Affidavit.findByPk(affidavit.id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Affidavit created successfully',
      data: { affidavit: newAffidavit }
    });
  } catch (error) {
    console.error('Error creating affidavit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create affidavit'
    });
  }
};

// Update affidavit
const updateAffidavit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const affidavit = await Affidavit.findByPk(id);
    if (!affidavit) {
      return res.status(404).json({
        status: 'error',
        message: 'Affidavit not found'
      });
    }

    await affidavit.update(updateData);

    const updatedAffidavit = await Affidavit.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Affidavit updated successfully',
      data: { affidavit: updatedAffidavit }
    });
  } catch (error) {
    console.error('Error updating affidavit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update affidavit'
    });
  }
};

// Verify affidavit
const verifyAffidavit = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const affidavit = await Affidavit.findByPk(id);
    if (!affidavit) {
      return res.status(404).json({
        status: 'error',
        message: 'Affidavit not found'
      });
    }

    await affidavit.update({
      status,
      remarks,
      verifiedBy: req.user.id,
      verifiedAt: new Date()
    });

    const updatedAffidavit = await Affidavit.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['firstName', 'lastName']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Affidavit verification updated successfully',
      data: { affidavit: updatedAffidavit }
    });
  } catch (error) {
    console.error('Error verifying affidavit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to verify affidavit'
    });
  }
};

// Delete affidavit
const deleteAffidavit = async (req, res) => {
  try {
    const { id } = req.params;

    const affidavit = await Affidavit.findByPk(id);
    if (!affidavit) {
      return res.status(404).json({
        status: 'error',
        message: 'Affidavit not found'
      });
    }

    await affidavit.destroy();

    res.json({
      status: 'success',
      message: 'Affidavit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting affidavit:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete affidavit'
    });
  }
};

// Get affidavits by student
const getAffidavitsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const affidavits = await Affidavit.findAll({
      where: { studentId },
      include: [
        {
          model: User,
          as: 'verifiedByUser',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { affidavits }
    });
  } catch (error) {
    console.error('Error fetching student affidavits:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch student affidavits'
    });
  }
};

module.exports = {
  getAllAffidavits,
  getAffidavitById,
  createAffidavit,
  updateAffidavit,
  verifyAffidavit,
  deleteAffidavit,
  getAffidavitsByStudent
};
