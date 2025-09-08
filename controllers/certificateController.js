const { BonafideCertificate, LeavingCertificate, Affidavit, Student, User } = require('../models');
const { Op } = require('sequelize');

// Bonafide Certificate Management
const getBonafideCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', purpose = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { certificateNumber: { [Op.iLike]: `%${search}%` } },
        { purposeDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (purpose) {
      whereClause.purpose = purpose;
    }

    const { count, rows: certificates } = await BonafideCertificate.findAndCountAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', include: ['user'] },
        { model: User, as: 'issuedBy', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: certificates,
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

const createBonafideCertificate = async (req, res) => {
  try {
    const certificate = await BonafideCertificate.create(req.body);
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateBonafideCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await BonafideCertificate.update(req.body, { where: { id } });
    
    if (updated) {
      const certificate = await BonafideCertificate.findByPk(id);
      res.json({ success: true, data: certificate });
    } else {
      res.status(404).json({ success: false, message: 'Certificate not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Leaving Certificate Management
const getLeavingCertificates = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', reason = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { certificateNumber: { [Op.iLike]: `%${search}%` } },
        { reasonDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (reason) {
      whereClause.reasonForLeaving = reason;
    }

    const { count, rows: certificates } = await LeavingCertificate.findAndCountAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', include: ['user'] },
        { model: User, as: 'issuedBy', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: certificates,
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

const createLeavingCertificate = async (req, res) => {
  try {
    const certificate = await LeavingCertificate.create(req.body);
    res.status(201).json({ success: true, data: certificate });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Affidavit Management
const getAffidavits = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', type = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { documentNumber: { [Op.iLike]: `%${search}%` } },
        { remarks: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (type) {
      whereClause.type = type;
    }

    const { count, rows: affidavits } = await Affidavit.findAndCountAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', include: ['user'] },
        { model: User, as: 'verifiedBy', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: affidavits,
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

const createAffidavit = async (req, res) => {
  try {
    const affidavit = await Affidavit.create(req.body);
    res.status(201).json({ success: true, data: affidavit });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Bonafide Certificate Management
  getBonafideCertificates,
  createBonafideCertificate,
  updateBonafideCertificate,
  
  // Leaving Certificate Management
  getLeavingCertificates,
  createLeavingCertificate,
  
  // Affidavit Management
  getAffidavits,
  createAffidavit
};
