const { Vehicle, TransportFee, TransportPayment, Student } = require('../models');
const { Op } = require('sequelize');

// Vehicle Management
const getVehicles = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { vehicleNumber: { [Op.iLike]: `%${search}%` } },
        { driverName: { [Op.iLike]: `%${search}%` } },
        { route: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: vehicles } = await Vehicle.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: vehicles,
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

const createVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await Vehicle.update(req.body, { where: { id } });
    
    if (updated) {
      const vehicle = await Vehicle.findByPk(id);
      res.json({ success: true, data: vehicle });
    } else {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Vehicle.destroy({ where: { id } });
    
    if (deleted) {
      res.json({ success: true, message: 'Vehicle deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Vehicle not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transport Fee Management
const getTransportFees = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', studentId = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { route: { [Op.iLike]: `%${search}%` } },
        { pickupPoint: { [Op.iLike]: `%${search}%` } },
        { dropPoint: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: transportFees } = await TransportFee.findAndCountAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', include: ['user'] },
        { model: Vehicle, as: 'vehicle' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: transportFees,
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

const createTransportFee = async (req, res) => {
  try {
    const transportFee = await TransportFee.create(req.body);
    res.status(201).json({ success: true, data: transportFee });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Transport Payment Management
const getTransportPayments = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', studentId = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { paymentReference: { [Op.iLike]: `%${search}%` } },
        { bankName: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (studentId) {
      whereClause.studentId = studentId;
    }
    if (status) {
      whereClause.status = status;
    }

    const { count, rows: payments } = await TransportPayment.findAndCountAll({
      where: whereClause,
      include: [
        { model: Student, as: 'student', include: ['user'] },
        { model: TransportFee, as: 'transportFee' }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: payments,
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

const createTransportPayment = async (req, res) => {
  try {
    const payment = await TransportPayment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Vehicle Management
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  
  // Transport Fee Management
  getTransportFees,
  createTransportFee,
  
  // Transport Payment Management
  getTransportPayments,
  createTransportPayment
};
