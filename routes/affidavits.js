const express = require('express');
const router = express.Router();
const {
  getAllAffidavits,
  getAffidavitById,
  createAffidavit,
  updateAffidavit,
  verifyAffidavit,
  deleteAffidavit,
  getAffidavitsByStudent
} = require('../controllers/affidavitController');
const { protect, authorize } = require('../middleware/auth');
const { validateAffidavit, validateAffidavitUpdate } = require('../middleware/validation');

// Apply authentication to all routes
router.use(protect);

// Get all affidavits (Admin/Teacher only)
router.get('/', authorize('admin', 'teacher'), getAllAffidavits);

// Get affidavit by ID (Admin/Teacher only)
router.get('/:id', authorize('admin', 'teacher'), getAffidavitById);

// Create new affidavit (Admin/Teacher only)
router.post('/', authorize('admin', 'teacher'), validateAffidavit, createAffidavit);

// Update affidavit (Admin/Teacher only)
router.put('/:id', authorize('admin', 'teacher'), validateAffidavitUpdate, updateAffidavit);

// Verify affidavit (Admin/Teacher only)
router.patch('/:id/verify', authorize('admin', 'teacher'), verifyAffidavit);

// Delete affidavit (Admin only)
router.delete('/:id', authorize('admin'), deleteAffidavit);

// Get affidavits by student (Admin/Teacher only)
router.get('/student/:studentId', authorize('admin', 'teacher'), getAffidavitsByStudent);

module.exports = router;
