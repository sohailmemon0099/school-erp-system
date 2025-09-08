const express = require('express');
const router = express.Router();
const {
  getInquiries,
  getInquiry,
  getInquiryByInquiryId,
  createInquiry,
  updateInquiry,
  deleteInquiry,
  convertInquiryToStudent,
  getInquiryStats
} = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateInquiry,
  validateInquiryUpdate,
  validateUUID,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/inquiries
// @desc    Get all inquiries
// @access  Private (Admin, Staff)
router.get('/', protect, authorize('admin', 'teacher'), validatePagination, getInquiries);

// @route   GET /api/inquiries/stats
// @desc    Get inquiry statistics
// @access  Private (Admin)
router.get('/stats', protect, authorize('admin'), getInquiryStats);

// @route   GET /api/inquiries/lookup/:inquiryId
// @desc    Get inquiry by inquiry ID
// @access  Private
router.get('/lookup/:inquiryId', protect, getInquiryByInquiryId);

// @route   GET /api/inquiries/:id
// @desc    Get single inquiry
// @access  Private
router.get('/:id', protect, validateUUID, getInquiry);

// @route   POST /api/inquiries
// @desc    Create new inquiry
// @access  Public (for new inquiries from website/walk-ins)
router.post('/', validateInquiry, createInquiry);

// @route   POST /api/inquiries/admin
// @desc    Create new inquiry (admin/staff)
// @access  Private (Admin, Staff)
router.post('/admin', protect, authorize('admin', 'teacher'), validateInquiry, createInquiry);

// @route   PUT /api/inquiries/:id
// @desc    Update inquiry
// @access  Private (Admin, Staff)
router.put('/:id', protect, authorize('admin', 'teacher'), validateUUID, validateInquiryUpdate, updateInquiry);

// @route   DELETE /api/inquiries/:id
// @desc    Delete inquiry
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), validateUUID, deleteInquiry);

// @route   POST /api/inquiries/:id/convert-to-student
// @desc    Convert inquiry to student
// @access  Private (Admin)
router.post('/:id/convert-to-student', protect, authorize('admin'), validateUUID, convertInquiryToStudent);

module.exports = router;
