const express = require('express');
const router = express.Router();
const {
  getAllBulkSMS,
  getBulkSMSById,
  createBulkSMS,
  sendBulkSMS,
  updateBulkSMS,
  deleteBulkSMS,
  getRecipients
} = require('../controllers/bulkSMSController');
const { protect, authorize } = require('../middleware/auth');
const { validateBulkSMS, validateBulkSMSUpdate } = require('../middleware/validation');

// Apply authentication to all routes
router.use(protect);

// Get all bulk SMS campaigns (Admin/Teacher only)
router.get('/', authorize('admin', 'teacher'), getAllBulkSMS);

// Get bulk SMS campaign by ID (Admin/Teacher only)
router.get('/:id', authorize('admin', 'teacher'), getBulkSMSById);

// Get recipients for preview (Admin/Teacher only)
router.get('/recipients/preview', authorize('admin', 'teacher'), getRecipients);

// Create new bulk SMS campaign (Admin/Teacher only)
router.post('/', authorize('admin', 'teacher'), validateBulkSMS, createBulkSMS);

// Send bulk SMS campaign (Admin/Teacher only)
router.post('/:id/send', authorize('admin', 'teacher'), sendBulkSMS);

// Update bulk SMS campaign (Admin/Teacher only)
router.put('/:id', authorize('admin', 'teacher'), validateBulkSMSUpdate, updateBulkSMS);

// Delete bulk SMS campaign (Admin only)
router.delete('/:id', authorize('admin'), deleteBulkSMS);

module.exports = router;
