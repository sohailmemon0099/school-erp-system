const express = require('express');
const router = express.Router();
const {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  createFeePayment,
  getFeePayments,
  updateFeePayment,
  getFeeStats
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

// Fee Structure Routes
router.post('/structures', protect, authorize('admin', 'accountant'), createFeeStructure);
router.get('/structures', protect, getFeeStructures);
router.get('/structures/:id', protect, getFeeStructure);
router.put('/structures/:id', protect, authorize('admin', 'accountant'), updateFeeStructure);
router.delete('/structures/:id', protect, authorize('admin'), deleteFeeStructure);

// Fee Payment Routes
router.post('/payments', protect, authorize('admin', 'accountant'), createFeePayment);
router.get('/payments', protect, getFeePayments);
router.put('/payments/:id', protect, authorize('admin', 'accountant'), updateFeePayment);

// Fee Statistics
router.get('/stats', protect, getFeeStats);

module.exports = router;