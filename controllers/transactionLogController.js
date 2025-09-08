const { TransactionLog, Student, User, Cheque, FeePayment, TransportPayment } = require('../models');
const { Op } = require('sequelize');

// Get all transaction logs
const getTransactionLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, transactionType, paymentMethod, status, academicYear, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { transactionId: { [Op.iLike]: `%${search}%` } },
        { referenceNumber: { [Op.iLike]: `%${search}%` } },
        { gatewayTransactionId: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (transactionType) where.transactionType = transactionType;
    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (status) where.status = status;
    if (academicYear) where.academicYear = academicYear;
    
    if (startDate && endDate) {
      where.processedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows: transactions } = await TransactionLog.findAndCountAll({
      where,
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ]},
        { model: Cheque, as: 'cheque', attributes: ['chequeNumber', 'bankName', 'status'] },
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
        transactions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transaction logs:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transaction logs' });
  }
};

// Get transaction log by ID
const getTransactionLogById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await TransactionLog.findByPk(id, {
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ]},
        { model: Cheque, as: 'cheque', attributes: ['chequeNumber', 'bankName', 'status'] },
        { model: FeePayment, as: 'feePayment', attributes: ['id', 'amount', 'status'] },
        { model: TransportPayment, as: 'transportPayment', attributes: ['id', 'amount', 'status'] },
        { model: User, as: 'processor', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction log not found' });
    }

    res.json({ status: 'success', data: { transaction } });
  } catch (error) {
    console.error('Error fetching transaction log:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transaction log' });
  }
};

// Create transaction log
const createTransactionLog = async (req, res) => {
  try {
    const {
      transactionType,
      paymentMethod,
      amount,
      currency,
      studentId,
      feePaymentId,
      transportPaymentId,
      chequeId,
      academicYear,
      description,
      referenceNumber,
      gatewayTransactionId,
      gatewayResponse,
      metadata
    } = req.body;

    const transactionId = generateTransactionId(transactionType);

    const transaction = await TransactionLog.create({
      transactionId,
      transactionType,
      paymentMethod,
      amount,
      currency,
      status: 'pending',
      studentId,
      feePaymentId,
      transportPaymentId,
      chequeId,
      academicYear,
      description,
      referenceNumber,
      gatewayTransactionId,
      gatewayResponse,
      metadata,
      processedBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Transaction log created successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Error creating transaction log:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create transaction log' });
  }
};

// Update transaction status
const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, gatewayResponse, metadata } = req.body;

    const transaction = await TransactionLog.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction log not found' });
    }

    const updateData = { status };
    
    if (status === 'completed') {
      updateData.processedAt = new Date();
    }

    if (gatewayResponse) {
      updateData.gatewayResponse = gatewayResponse;
    }

    if (metadata) {
      updateData.metadata = { ...transaction.metadata, ...metadata };
    }

    await transaction.update(updateData);

    res.json({
      status: 'success',
      message: 'Transaction status updated successfully',
      data: { transaction }
    });
  } catch (error) {
    console.error('Error updating transaction status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update transaction status' });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const { academicYear, startDate, endDate } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;
    
    if (startDate && endDate) {
      where.processedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const totalTransactions = await TransactionLog.count({ where });
    const completedTransactions = await TransactionLog.count({ where: { ...where, status: 'completed' } });
    const pendingTransactions = await TransactionLog.count({ where: { ...where, status: 'pending' } });
    const failedTransactions = await TransactionLog.count({ where: { ...where, status: 'failed' } });
    const cancelledTransactions = await TransactionLog.count({ where: { ...where, status: 'cancelled' } });
    const refundedTransactions = await TransactionLog.count({ where: { ...where, status: 'refunded' } });

    // Calculate total amounts
    const totalAmount = await TransactionLog.sum('amount', { where });
    const completedAmount = await TransactionLog.sum('amount', { where: { ...where, status: 'completed' } });
    const pendingAmount = await TransactionLog.sum('amount', { where: { ...where, status: 'pending' } });
    const failedAmount = await TransactionLog.sum('amount', { where: { ...where, status: 'failed' } });

    // Get payment method statistics
    const paymentMethodStats = await TransactionLog.findAll({
      where,
      attributes: [
        'paymentMethod',
        [TransactionLog.sequelize.fn('COUNT', TransactionLog.sequelize.col('id')), 'count'],
        [TransactionLog.sequelize.fn('SUM', TransactionLog.sequelize.col('amount')), 'totalAmount']
      ],
      group: ['paymentMethod'],
      order: [[TransactionLog.sequelize.fn('COUNT', TransactionLog.sequelize.col('id')), 'DESC']]
    });

    // Get transaction type statistics
    const transactionTypeStats = await TransactionLog.findAll({
      where,
      attributes: [
        'transactionType',
        [TransactionLog.sequelize.fn('COUNT', TransactionLog.sequelize.col('id')), 'count'],
        [TransactionLog.sequelize.fn('SUM', TransactionLog.sequelize.col('amount')), 'totalAmount']
      ],
      group: ['transactionType'],
      order: [[TransactionLog.sequelize.fn('COUNT', TransactionLog.sequelize.col('id')), 'DESC']]
    });

    // Get recent transactions
    const recentTransactions = await TransactionLog.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'processor', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    // Get daily transaction summary for the last 30 days
    const dailyStats = await TransactionLog.findAll({
      where: {
        ...where,
        processedAt: {
          [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      attributes: [
        [TransactionLog.sequelize.fn('DATE', TransactionLog.sequelize.col('processedAt')), 'date'],
        [TransactionLog.sequelize.fn('COUNT', TransactionLog.sequelize.col('id')), 'count'],
        [TransactionLog.sequelize.fn('SUM', TransactionLog.sequelize.col('amount')), 'totalAmount']
      ],
      group: [TransactionLog.sequelize.fn('DATE', TransactionLog.sequelize.col('processedAt'))],
      order: [[TransactionLog.sequelize.fn('DATE', TransactionLog.sequelize.col('processedAt')), 'DESC']],
      limit: 30
    });

    res.json({
      status: 'success',
      data: {
        totalTransactions,
        completedTransactions,
        pendingTransactions,
        failedTransactions,
        cancelledTransactions,
        refundedTransactions,
        totalAmount: totalAmount || 0,
        completedAmount: completedAmount || 0,
        pendingAmount: pendingAmount || 0,
        failedAmount: failedAmount || 0,
        paymentMethodStats,
        transactionTypeStats,
        recentTransactions,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transaction statistics' });
  }
};

// Generate unique transaction ID
const generateTransactionId = (type) => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${type.toUpperCase()}_${timestamp}_${random}`;
};

// Export transaction logs
const exportTransactionLogs = async (req, res) => {
  try {
    const { format = 'json', startDate, endDate, transactionType, status } = req.query;
    
    const where = {};
    if (startDate && endDate) {
      where.processedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    if (transactionType) where.transactionType = transactionType;
    if (status) where.status = status;

    const transactions = await TransactionLog.findAll({
      where,
      include: [
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName', 'email'] }
        ]},
        { model: Cheque, as: 'cheque', attributes: ['chequeNumber', 'bankName'] },
        { model: User, as: 'processor', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (format === 'csv') {
      const csvData = generateCSVData(transactions);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="transaction_logs_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send(csvData);
    } else {
      res.json({
        status: 'success',
        data: { transactions }
      });
    }
  } catch (error) {
    console.error('Error exporting transaction logs:', error);
    res.status(500).json({ status: 'error', message: 'Failed to export transaction logs' });
  }
};

// Generate CSV data
const generateCSVData = (transactions) => {
  let csv = 'Transaction ID,Type,Payment Method,Amount,Status,Student,Reference,Date,Processor\n';
  
  transactions.forEach(transaction => {
    const studentName = transaction.student ? 
      `${transaction.student.user.firstName} ${transaction.student.user.lastName}` : 'N/A';
    const processorName = transaction.processor ? 
      `${transaction.processor.firstName} ${transaction.processor.lastName}` : 'N/A';
    const date = transaction.processedAt ? 
      new Date(transaction.processedAt).toLocaleDateString() : 'N/A';
    
    csv += `${transaction.transactionId},${transaction.transactionType},${transaction.paymentMethod},${transaction.amount},${transaction.status},${studentName},${transaction.referenceNumber || ''},${date},${processorName}\n`;
  });

  return csv;
};

module.exports = {
  getTransactionLogs,
  getTransactionLogById,
  createTransactionLog,
  updateTransactionStatus,
  getTransactionStats,
  exportTransactionLogs
};
