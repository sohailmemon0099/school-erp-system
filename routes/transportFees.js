const express = require('express');
const router = express.Router();
const {
  createTransportFee,
  getTransportFees,
  getTransportFeeById,
  updateTransportFee,
  deleteTransportFee,
  recordPayment,
  getTransportFeeStats,
  getTransportPayments
} = require('../controllers/transportFeeController');
const { protect, authorize } = require('../middleware/auth');
const { validateTransportFee, validateTransportFeeUpdate, validateTransportPayment } = require('../middleware/validation');
const { validateUUID, validatePagination } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Transport fee management routes (admin/teacher only)
router.post('/', authorize(['admin', 'teacher']), validateTransportFee, createTransportFee);
router.get('/', validatePagination, getTransportFees);
router.get('/stats', authorize(['admin', 'teacher']), getTransportFeeStats);
router.get('/payments', validatePagination, getTransportPayments);
router.get('/:id', validateUUID, getTransportFeeById);
router.put('/:id', authorize(['admin', 'teacher']), validateUUID, validateTransportFeeUpdate, updateTransportFee);
router.delete('/:id', authorize(['admin', 'teacher']), validateUUID, deleteTransportFee);

// Payment routes
router.post('/:transportFeeId/payments', authorize(['admin', 'teacher']), validateTransportPayment, recordPayment);

module.exports = router;
