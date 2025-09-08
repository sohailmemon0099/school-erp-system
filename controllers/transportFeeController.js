const { TransportFee, TransportPayment, Student, Vehicle, User } = require('../models');
const { Op } = require('sequelize');

// Create new transport fee
const createTransportFee = async (req, res) => {
  try {
    const {
      studentId,
      vehicleId,
      route,
      pickupPoint,
      dropPoint,
      distance,
      monthlyFee,
      academicYear,
      semester,
      startDate,
      endDate,
      remarks
    } = req.body;

    // Generate unique fee ID
    const feeId = `TF${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const transportFee = await TransportFee.create({
      feeId,
      studentId,
      vehicleId,
      route,
      pickupPoint,
      dropPoint,
      distance,
      monthlyFee,
      academicYear,
      semester,
      startDate,
      endDate,
      remarks,
      createdBy: req.user.id
    });

    const createdTransportFee = await TransportFee.findByPk(transportFee.id, {
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'creator' }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: { transportFee: createdTransportFee }
    });
  } catch (error) {
    console.error('Error creating transport fee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create transport fee'
    });
  }
};

// Get all transport fees with filters
const getTransportFees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      vehicleId,
      route,
      status,
      paymentStatus,
      academicYear,
      semester,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    if (studentId) where.studentId = studentId;
    if (vehicleId) where.vehicleId = vehicleId;
    if (route) where.route = { [Op.iLike]: `%${route}%` };
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (academicYear) where.academicYear = academicYear;
    if (semester) where.semester = semester;

    if (search) {
      where[Op.or] = [
        { route: { [Op.iLike]: `%${search}%` } },
        { pickupPoint: { [Op.iLike]: `%${search}%` } },
        { dropPoint: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const { count, rows: transportFees } = await TransportFee.findAndCountAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'creator' }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        transportFees,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transport fees:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transport fees'
    });
  }
};

// Get single transport fee with payments
const getTransportFeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const transportFee = await TransportFee.findByPk(id, {
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'creator' },
        {
          model: TransportPayment,
          as: 'payments',
          include: [{ model: User, as: 'collector' }]
        }
      ]
    });

    if (!transportFee) {
      return res.status(404).json({
        status: 'error',
        message: 'Transport fee not found'
      });
    }

    res.json({
      status: 'success',
      data: { transportFee }
    });
  } catch (error) {
    console.error('Error fetching transport fee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transport fee'
    });
  }
};

// Update transport fee
const updateTransportFee = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const transportFee = await TransportFee.findByPk(id);
    if (!transportFee) {
      return res.status(404).json({
        status: 'error',
        message: 'Transport fee not found'
      });
    }

    await transportFee.update(updateData);

    const updatedTransportFee = await TransportFee.findByPk(id, {
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: Vehicle, as: 'vehicle' },
        { model: User, as: 'creator' }
      ]
    });

    res.json({
      status: 'success',
      data: { transportFee: updatedTransportFee }
    });
  } catch (error) {
    console.error('Error updating transport fee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update transport fee'
    });
  }
};

// Delete transport fee
const deleteTransportFee = async (req, res) => {
  try {
    const { id } = req.params;

    const transportFee = await TransportFee.findByPk(id);
    if (!transportFee) {
      return res.status(404).json({
        status: 'error',
        message: 'Transport fee not found'
      });
    }

    await transportFee.update({ isActive: false });

    res.json({
      status: 'success',
      message: 'Transport fee deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transport fee:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete transport fee'
    });
  }
};

// Record transport payment
const recordPayment = async (req, res) => {
  try {
    const { transportFeeId } = req.params;
    const {
      amount,
      paymentMethod,
      paymentReference,
      bankName,
      chequeNumber,
      chequeDate,
      month,
      year,
      remarks
    } = req.body;

    const transportFee = await TransportFee.findByPk(transportFeeId);
    if (!transportFee) {
      return res.status(404).json({
        status: 'error',
        message: 'Transport fee not found'
      });
    }

    // Generate unique payment ID
    const paymentId = `TP${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const payment = await TransportPayment.create({
      paymentId,
      transportFeeId,
      studentId: transportFee.studentId,
      amount,
      paymentMethod,
      paymentReference,
      bankName,
      chequeNumber,
      chequeDate,
      month,
      year,
      academicYear: transportFee.academicYear,
      remarks,
      collectedBy: req.user.id
    });

    // Update transport fee payment status
    const totalPaid = await TransportPayment.sum('amount', {
      where: { transportFeeId, status: 'completed' }
    });

    const paymentStatus = totalPaid >= transportFee.monthlyFee ? 'paid' : 'partial';
    await transportFee.update({
      paymentStatus,
      lastPaymentDate: new Date()
    });

    const createdPayment = await TransportPayment.findByPk(payment.id, {
      include: [
        { model: User, as: 'collector' },
        { model: TransportFee, as: 'transportFee' }
      ]
    });

    res.status(201).json({
      status: 'success',
      data: { payment: createdPayment }
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to record payment'
    });
  }
};

// Get transport fee statistics
const getTransportFeeStats = async (req, res) => {
  try {
    const { academicYear, semester } = req.query;
    const where = { isActive: true };

    if (academicYear) where.academicYear = academicYear;
    if (semester) where.semester = semester;

    const totalTransportFees = await TransportFee.count({ where });

    const statusCounts = await TransportFee.findAll({
      where,
      attributes: [
        'status',
        [TransportFee.sequelize.fn('COUNT', TransportFee.sequelize.col('id')), 'count']
      ],
      group: ['status']
    });

    const paymentStatusCounts = await TransportFee.findAll({
      where,
      attributes: [
        'paymentStatus',
        [TransportFee.sequelize.fn('COUNT', TransportFee.sequelize.col('id')), 'count']
      ],
      group: ['paymentStatus']
    });

    const totalMonthlyRevenue = await TransportFee.sum('monthlyFee', {
      where: { ...where, status: 'active' }
    });

    const totalCollected = await TransportPayment.sum('amount', {
      where: { status: 'completed' }
    });

    res.json({
      status: 'success',
      data: {
        totalTransportFees,
        statusCounts,
        paymentStatusCounts,
        totalMonthlyRevenue,
        totalCollected,
        pendingAmount: totalMonthlyRevenue - totalCollected
      }
    });
  } catch (error) {
    console.error('Error fetching transport fee stats:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transport fee statistics'
    });
  }
};

// Get transport payments
const getTransportPayments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      studentId,
      transportFeeId,
      paymentMethod,
      status,
      month,
      year,
      academicYear
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (studentId) where.studentId = studentId;
    if (transportFeeId) where.transportFeeId = transportFeeId;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (status) where.status = status;
    if (month) where.month = month;
    if (year) where.year = year;
    if (academicYear) where.academicYear = academicYear;

    const { count, rows: payments } = await TransportPayment.findAndCountAll({
      where,
      include: [
        { model: Student, as: 'student', include: [{ model: User, as: 'user' }] },
        { model: TransportFee, as: 'transportFee' },
        { model: User, as: 'collector' }
      ],
      order: [['paymentDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        payments,
        pagination: {
          total: count,
          pages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transport payments:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transport payments'
    });
  }
};

module.exports = {
  createTransportFee,
  getTransportFees,
  getTransportFeeById,
  updateTransportFee,
  deleteTransportFee,
  recordPayment,
  getTransportFeeStats,
  getTransportPayments
};
