const express = require('express');
const router = express.Router();
const transactionReportController = require('../controllers/transactionReportController');
const auth = require('../middleware/auth');
const { validateTransactionReport } = require('../middleware/validation');

// Get transaction reports with filters
router.get('/', auth.protect, transactionReportController.getTransactionReports);

// Get transaction report by ID
router.get('/:id', auth.protect, transactionReportController.getTransactionReportById);

// Create transaction report
router.post('/', auth.protect, validateTransactionReport, transactionReportController.createTransactionReport);

// Update transaction report
router.put('/:id', auth.protect, validateTransactionReport, transactionReportController.updateTransactionReport);

// Delete transaction report
router.delete('/:id', auth.protect, transactionReportController.deleteTransactionReport);

// Get transaction summary for dashboard
router.get('/summary/dashboard', auth.protect, transactionReportController.getTransactionSummary);

// Export transaction reports
router.get('/export/csv', auth.protect, transactionReportController.exportTransactionReports);

module.exports = router;
