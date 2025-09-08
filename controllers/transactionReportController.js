const { TransactionReport, Student, User, FeePayment, TransportPayment, Class } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Get transaction reports with filters
const getTransactionReports = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      startDate, 
      endDate, 
      paymentMode, 
      transactionType,
      classId,
      studentId,
      status,
      viewBy = 'receipt_transaction'
    } = req.query;
    
    const offset = (page - 1) * limit;

    // Build where clause
    const where = {};
    
    // Date range filter
    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      where.transactionDate = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      where.transactionDate = {
        [Op.lte]: new Date(endDate)
      };
    }

    // Payment mode filter
    if (paymentMode && paymentMode !== 'all') {
      where.paymentMode = paymentMode;
    }

    // Transaction type filter
    if (transactionType && transactionType !== 'all') {
      where.transactionType = transactionType;
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status;
    }

    // Student filter
    if (studentId) {
      where.studentId = studentId;
    }

    // Class filter (through student)
    let includeStudent = {
      model: Student,
      as: 'student',
      attributes: ['id', 'studentId'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }]
    };

    if (classId && classId !== 'all') {
      includeStudent.where = { classId };
    }

    const transactions = await TransactionReport.findAndCountAll({
      where,
      include: [
        includeStudent,
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['transactionDate', 'DESC']]
    });

    // Calculate summary statistics
    const summary = await TransactionReport.findAll({
      where,
      attributes: [
        'paymentMode',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['paymentMode'],
      raw: true
    });

    const totalAmount = summary.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
    const totalTransactions = transactions.count;

    res.json({
      status: 'success',
      data: {
        transactions: transactions.rows,
        summary: {
          totalTransactions,
          totalAmount,
          paymentModeBreakdown: summary
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(transactions.count / limit),
          totalItems: transactions.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching transaction reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transaction reports' });
  }
};

// Get transaction report by ID
const getTransactionReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await TransactionReport.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'phone']
          }, {
            model: Class,
            as: 'class',
            attributes: ['id', 'name', 'section']
          }]
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    res.json({
      status: 'success',
      data: { transaction }
    });
  } catch (error) {
    console.error('Error fetching transaction report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transaction report' });
  }
};

// Create transaction report (usually called when payments are made)
const createTransactionReport = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transactionData = { ...req.body, processedBy: req.user.id };
    const transaction = await TransactionReport.create(transactionData);

    const createdTransaction = await TransactionReport.findByPk(transaction.id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Transaction report created successfully',
      data: { transaction: createdTransaction }
    });
  } catch (error) {
    console.error('Error creating transaction report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create transaction report' });
  }
};

// Update transaction report
const updateTransactionReport = async (req, res) => {
  try {
    const { id } = req.params;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const transaction = await TransactionReport.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    await transaction.update(req.body);

    const updatedTransaction = await TransactionReport.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'studentId'],
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        },
        {
          model: User,
          as: 'processor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      status: 'success',
      message: 'Transaction report updated successfully',
      data: { transaction: updatedTransaction }
    });
  } catch (error) {
    console.error('Error updating transaction report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update transaction report' });
  }
};

// Delete transaction report
const deleteTransactionReport = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await TransactionReport.findByPk(id);
    if (!transaction) {
      return res.status(404).json({ status: 'error', message: 'Transaction not found' });
    }

    await transaction.destroy();

    res.json({
      status: 'success',
      message: 'Transaction report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting transaction report:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete transaction report' });
  }
};

// Get transaction summary for dashboard
const getTransactionSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get daily transaction summary
    const dailySummary = await TransactionReport.findAll({
      where,
      attributes: [
        [sequelize.fn('DATE', sequelize.col('transactionDate')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: [sequelize.fn('DATE', sequelize.col('transactionDate'))],
      order: [[sequelize.fn('DATE', sequelize.col('transactionDate')), 'DESC']],
      limit: 30,
      raw: true
    });

    // Get payment mode summary
    const paymentModeSummary = await TransactionReport.findAll({
      where,
      attributes: [
        'paymentMode',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['paymentMode'],
      raw: true
    });

    // Get transaction type summary
    const transactionTypeSummary = await TransactionReport.findAll({
      where,
      attributes: [
        'transactionType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount']
      ],
      group: ['transactionType'],
      raw: true
    });

    res.json({
      status: 'success',
      data: {
        dailySummary,
        paymentModeSummary,
        transactionTypeSummary
      }
    });
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch transaction summary' });
  }
};

// Export transaction reports to CSV
const exportTransactionReports = async (req, res) => {
  try {
    const { startDate, endDate, paymentMode, transactionType, classId } = req.query;

    const where = {};
    
    if (startDate && endDate) {
      where.transactionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    if (paymentMode && paymentMode !== 'all') {
      where.paymentMode = paymentMode;
    }

    if (transactionType && transactionType !== 'all') {
      where.transactionType = transactionType;
    }

    let includeStudent = {
      model: Student,
      as: 'student',
      attributes: ['id', 'studentId'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }, {
        model: Class,
        as: 'class',
        attributes: ['name', 'section']
      }]
    };

    if (classId && classId !== 'all') {
      includeStudent.where = { classId };
    }

    const transactions = await TransactionReport.findAll({
      where,
      include: [
        includeStudent,
        {
          model: User,
          as: 'processor',
          attributes: ['firstName', 'lastName']
        }
      ],
      order: [['transactionDate', 'DESC']]
    });

    // Convert to CSV format
    const csvData = transactions.map(transaction => ({
      'Receipt Number': transaction.receiptNumber,
      'Date': transaction.transactionDate.toISOString().split('T')[0],
      'Student Name': `${transaction.student?.user?.firstName} ${transaction.student?.user?.lastName}`,
      'Student ID': transaction.student?.studentId,
      'Class': `${transaction.student?.class?.name} ${transaction.student?.class?.section}`,
      'Transaction Type': transaction.transactionType,
      'Amount': transaction.amount,
      'Payment Mode': transaction.paymentMode,
      'Status': transaction.status,
      'Processed By': `${transaction.processor?.firstName} ${transaction.processor?.lastName}`,
      'Description': transaction.description
    }));

    res.json({
      status: 'success',
      data: { transactions: csvData }
    });
  } catch (error) {
    console.error('Error exporting transaction reports:', error);
    res.status(500).json({ status: 'error', message: 'Failed to export transaction reports' });
  }
};

module.exports = {
  getTransactionReports,
  getTransactionReportById,
  createTransactionReport,
  updateTransactionReport,
  deleteTransactionReport,
  getTransactionSummary,
  exportTransactionReports
};
