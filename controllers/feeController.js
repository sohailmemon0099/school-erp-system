const { FeeStructure, FeePayment, Student, Class, User } = require('../models');
const { Op } = require('sequelize');

// Fee Structure Management
const createFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { feeStructure }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const getFeeStructures = async (req, res) => {
  try {
    const { classId, feeType, academicYear } = req.query;
    const where = {};
    
    if (classId) where.classId = classId;
    if (feeType) where.feeType = feeType;
    if (academicYear) where.academicYear = academicYear;
    
    const feeStructures = await FeeStructure.findAll({
      where,
      include: [{
        model: Class,
        as: 'class',
        attributes: ['name', 'section']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      status: 'success',
      data: { feeStructures }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const getFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findByPk(req.params.id, {
      include: [{
        model: Class,
        as: 'class',
        attributes: ['name', 'section']
      }]
    });
    
    if (!feeStructure) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee structure not found'
      });
    }
    
    res.json({
      status: 'success',
      data: { feeStructure }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const updateFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findByPk(req.params.id);
    
    if (!feeStructure) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee structure not found'
      });
    }
    
    await feeStructure.update(req.body);
    
    res.json({
      status: 'success',
      data: { feeStructure }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const deleteFeeStructure = async (req, res) => {
  try {
    const feeStructure = await FeeStructure.findByPk(req.params.id);
    
    if (!feeStructure) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee structure not found'
      });
    }
    
    await feeStructure.destroy();
    
    res.json({
      status: 'success',
      message: 'Fee structure deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Fee Payment Management
const createFeePayment = async (req, res) => {
  try {
    const { studentId, feeStructureId, amount, paymentMethod, transactionId, remarks } = req.body;
    
    // Get fee structure
    const feeStructure = await FeeStructure.findByPk(feeStructureId);
    if (!feeStructure) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee structure not found'
      });
    }
    
    // Check if payment already exists
    const existingPayment = await FeePayment.findOne({
      where: { studentId, feeStructureId }
    });
    
    if (existingPayment) {
      return res.status(400).json({
        status: 'error',
        message: 'Payment record already exists for this student and fee structure'
      });
    }
    
    // Calculate balance
    const balanceAmount = amount - (req.body.paidAmount || 0);
    const paymentStatus = balanceAmount <= 0 ? 'paid' : (req.body.paidAmount > 0 ? 'partial' : 'pending');
    
    const feePayment = await FeePayment.create({
      studentId,
      feeStructureId,
      amount,
      paidAmount: req.body.paidAmount || 0,
      balanceAmount,
      paymentStatus,
      dueDate: feeStructure.dueDate,
      paymentMethod,
      transactionId,
      remarks,
      collectedBy: req.user.id
    });
    
    res.status(201).json({
      status: 'success',
      data: { feePayment }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const getFeePayments = async (req, res) => {
  try {
    const { studentId, paymentStatus, classId, academicYear } = req.query;
    const where = {};
    
    if (studentId) where.studentId = studentId;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    
    const include = [{
      model: Student,
      as: 'student',
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }]
    }, {
      model: FeeStructure,
      as: 'feeStructure',
      include: [{
        model: Class,
        as: 'class',
        attributes: ['name', 'section']
      }]
    }];
    
    if (classId) {
      include[1].include[0].where = { id: classId };
    }
    
    const feePayments = await FeePayment.findAll({
      where,
      include,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      status: 'success',
      data: { feePayments }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

const updateFeePayment = async (req, res) => {
  try {
    const feePayment = await FeePayment.findByPk(req.params.id);
    
    if (!feePayment) {
      return res.status(404).json({
        status: 'error',
        message: 'Fee payment not found'
      });
    }
    
    const { paidAmount, paymentMethod, transactionId, remarks } = req.body;
    
    // Calculate new balance
    const newPaidAmount = paidAmount || feePayment.paidAmount;
    const newBalanceAmount = feePayment.amount - newPaidAmount;
    const newPaymentStatus = newBalanceAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'pending');
    
    await feePayment.update({
      paidAmount: newPaidAmount,
      balanceAmount: newBalanceAmount,
      paymentStatus: newPaymentStatus,
      paidDate: newPaidAmount > 0 ? new Date() : null,
      paymentMethod,
      transactionId,
      remarks
    });
    
    res.json({
      status: 'success',
      data: { feePayment }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

const getFeeStats = async (req, res) => {
  try {
    const { academicYear, classId } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;
    if (classId) where.classId = classId;
    
    const totalFees = await FeeStructure.sum('amount', { where });
    const totalPaid = await FeePayment.sum('paidAmount');
    const totalPending = await FeePayment.sum('balanceAmount', {
      where: { paymentStatus: { [Op.ne]: 'paid' } }
    });
    
    const paymentStatusCounts = await FeePayment.findAll({
      attributes: [
        'paymentStatus',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['paymentStatus']
    });
    
    const feeTypeStats = await FeeStructure.findAll({
      attributes: [
        'feeType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['feeType']
    });
    
    res.json({
      status: 'success',
      data: {
        totalFees: totalFees || 0,
        totalPaid: totalPaid || 0,
        totalPending: totalPending || 0,
        paymentStatusCounts,
        feeTypeStats
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  createFeePayment,
  getFeePayments,
  updateFeePayment,
  getFeeStats
};