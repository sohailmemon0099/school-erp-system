const { Cheque, Student, User, FeePayment, TransportPayment, TransactionLog } = require('../models');
const { Op } = require('sequelize');

// Generate unique transaction ID
const generateTransactionId = (type) => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${type.toUpperCase()}_${timestamp}_${random}`;
};

// Get all cheques
const getCheques = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, status, paymentType, academicYear, bankName } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { chequeNumber: { [Op.iLike]: `%${search}%` } },
        { bankName: { [Op.iLike]: `%${search}%` } },
        { accountHolderName: { [Op.iLike]: `%${search}%` } },
        { accountNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (status) where.status = status;
    if (paymentType) where.paymentType = paymentType;
    if (academicYear) where.academicYear = academicYear;
    if (bankName) where.bankName = { [Op.iLike]: `%${bankName}%` };

    const { count, rows: cheques } = await Cheque.findAndCountAll({
      where,
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ]},
        { model: FeePayment, as: 'feePayment', attributes: ['id', 'amount', 'status'] },
        { model: TransportPayment, as: 'transportPayment', attributes: ['id', 'amount', 'status'] },
        { model: User, as: 'processor', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        cheques,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching cheques:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch cheques' });
  }
};

// Get cheque by ID
const getChequeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const cheque = await Cheque.findByPk(id, {
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ]},
        { model: FeePayment, as: 'feePayment', attributes: ['id', 'amount', 'status'] },
        { model: TransportPayment, as: 'transportPayment', attributes: ['id', 'amount', 'status'] },
        { model: User, as: 'processor', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!cheque) {
      return res.status(404).json({ status: 'error', message: 'Cheque not found' });
    }

    res.json({ status: 'success', data: { cheque } });
  } catch (error) {
    console.error('Error fetching cheque:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch cheque' });
  }
};

// Create cheque
const createCheque = async (req, res) => {
  try {
    const {
      chequeNumber,
      bankName,
      branchName,
      accountNumber,
      accountHolderName,
      amount,
      issueDate,
      dueDate,
      paymentType,
      studentId,
      feePaymentId,
      transportPaymentId,
      academicYear,
      remarks
    } = req.body;

    // Check if cheque number already exists
    const existingCheque = await Cheque.findOne({ where: { chequeNumber } });
    if (existingCheque) {
      return res.status(400).json({ status: 'error', message: 'Cheque number already exists' });
    }

    const cheque = await Cheque.create({
      chequeNumber,
      bankName,
      branchName,
      accountNumber,
      accountHolderName,
      amount,
      issueDate,
      dueDate,
      paymentType,
      studentId,
      feePaymentId,
      transportPaymentId,
      academicYear,
      remarks,
      processedBy: req.user.id
    });

    // Create transaction log
    const transactionId = generateTransactionId('cheque');
    await TransactionLog.create({
      transactionId,
      transactionType: 'cheque_cleared',
      paymentMethod: 'cheque',
      amount,
      status: 'pending',
      studentId,
      feePaymentId,
      transportPaymentId,
      chequeId: cheque.id,
      academicYear,
      description: `Cheque ${chequeNumber} received from ${bankName}`,
      referenceNumber: chequeNumber,
      processedBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Cheque created successfully',
      data: { cheque }
    });
  } catch (error) {
    console.error('Error creating cheque:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create cheque' });
  }
};

// Update cheque status
const updateChequeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, bouncedReason, remarks } = req.body;

    const cheque = await Cheque.findByPk(id);
    if (!cheque) {
      return res.status(404).json({ status: 'error', message: 'Cheque not found' });
    }

    const updateData = { status };
    
    if (status === 'cleared') {
      updateData.clearedDate = new Date().toISOString().split('T')[0];
    } else if (status === 'bounced') {
      updateData.bouncedDate = new Date().toISOString().split('T')[0];
      updateData.bouncedReason = bouncedReason;
    }

    if (remarks) {
      updateData.remarks = remarks;
    }

    await cheque.update(updateData);

    // Update transaction log
    const transactionId = generateTransactionId('cheque_update');
    await TransactionLog.create({
      transactionId,
      transactionType: status === 'cleared' ? 'cheque_cleared' : 'cheque_bounced',
      paymentMethod: 'cheque',
      amount: cheque.amount,
      status: status === 'cleared' ? 'completed' : 'failed',
      studentId: cheque.studentId,
      feePaymentId: cheque.feePaymentId,
      transportPaymentId: cheque.transportPaymentId,
      chequeId: cheque.id,
      academicYear: cheque.academicYear,
      description: `Cheque ${cheque.chequeNumber} ${status}`,
      referenceNumber: cheque.chequeNumber,
      metadata: { bouncedReason, remarks },
      processedAt: new Date(),
      processedBy: req.user.id
    });

    res.json({
      status: 'success',
      message: `Cheque ${status} successfully`,
      data: { cheque }
    });
  } catch (error) {
    console.error('Error updating cheque status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update cheque status' });
  }
};

// Delete cheque
const deleteCheque = async (req, res) => {
  try {
    const { id } = req.params;

    const cheque = await Cheque.findByPk(id);
    if (!cheque) {
      return res.status(404).json({ status: 'error', message: 'Cheque not found' });
    }

    await cheque.destroy();

    res.json({ status: 'success', message: 'Cheque deleted successfully' });
  } catch (error) {
    console.error('Error deleting cheque:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete cheque' });
  }
};

// Get cheque statistics
const getChequeStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;

    const totalCheques = await Cheque.count({ where });
    const pendingCheques = await Cheque.count({ where: { ...where, status: 'pending' } });
    const clearedCheques = await Cheque.count({ where: { ...where, status: 'cleared' } });
    const bouncedCheques = await Cheque.count({ where: { ...where, status: 'bounced' } });
    const cancelledCheques = await Cheque.count({ where: { ...where, status: 'cancelled' } });
    const expiredCheques = await Cheque.count({ where: { ...where, status: 'expired' } });

    // Calculate total amounts
    const totalAmount = await Cheque.sum('amount', { where });
    const clearedAmount = await Cheque.sum('amount', { where: { ...where, status: 'cleared' } });
    const pendingAmount = await Cheque.sum('amount', { where: { ...where, status: 'pending' } });
    const bouncedAmount = await Cheque.sum('amount', { where: { ...where, status: 'bounced' } });

    // Get recent cheques
    const recentCheques = await Cheque.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'processor', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get bank-wise statistics
    const bankStats = await Cheque.findAll({
      where,
      attributes: [
        'bankName',
        [Cheque.sequelize.fn('COUNT', Cheque.sequelize.col('id')), 'count'],
        [Cheque.sequelize.fn('SUM', Cheque.sequelize.col('amount')), 'totalAmount']
      ],
      group: ['bankName'],
      order: [[Cheque.sequelize.fn('COUNT', Cheque.sequelize.col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      status: 'success',
      data: {
        totalCheques,
        pendingCheques,
        clearedCheques,
        bouncedCheques,
        cancelledCheques,
        expiredCheques,
        totalAmount: totalAmount || 0,
        clearedAmount: clearedAmount || 0,
        pendingAmount: pendingAmount || 0,
        bouncedAmount: bouncedAmount || 0,
        recentCheques,
        bankStats
      }
    });
  } catch (error) {
    console.error('Error fetching cheque stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch cheque statistics' });
  }
};

// Validate cheque
const validateCheque = async (req, res) => {
  try {
    const { chequeNumber, bankName, accountNumber } = req.body;

    // Check if cheque exists
    const cheque = await Cheque.findOne({
      where: {
        chequeNumber,
        bankName,
        accountNumber
      }
    });

    if (!cheque) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Cheque not found',
        data: { isValid: false }
      });
    }

    // Check if cheque is expired
    const today = new Date();
    const dueDate = new Date(cheque.dueDate);
    const isExpired = today > dueDate;

    if (isExpired && cheque.status === 'pending') {
      await cheque.update({ status: 'expired' });
    }

    res.json({
      status: 'success',
      message: 'Cheque validation completed',
      data: {
        isValid: true,
        cheque: {
          id: cheque.id,
          chequeNumber: cheque.chequeNumber,
          amount: cheque.amount,
          status: cheque.status,
          issueDate: cheque.issueDate,
          dueDate: cheque.dueDate,
          isExpired
        }
      }
    });
  } catch (error) {
    console.error('Error validating cheque:', error);
    res.status(500).json({ status: 'error', message: 'Failed to validate cheque' });
  }
};

// Get pending cheques for processing
const getPendingCheques = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const pendingCheques = await Cheque.findAll({
      where: {
        status: 'pending',
        dueDate: {
          [Op.gte]: new Date().toISOString().split('T')[0]
        }
      },
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ]},
        { model: User, as: 'processor', attributes: ['firstName', 'lastName'] }
      ],
      order: [['dueDate', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: { pendingCheques }
    });
  } catch (error) {
    console.error('Error fetching pending cheques:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch pending cheques' });
  }
};

module.exports = {
  getCheques,
  getChequeById,
  createCheque,
  updateChequeStatus,
  deleteCheque,
  getChequeStats,
  validateCheque,
  getPendingCheques
};
