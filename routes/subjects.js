const express = require('express');
const router = express.Router();
const {
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject
} = require('../controllers/subjectController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateSubject,
  validateUUID,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', protect, validatePagination, getSubjects);

// @route   GET /api/subjects/:id
// @desc    Get single subject
// @access  Private
router.get('/:id', protect, validateUUID, getSubject);

// @route   POST /api/subjects
// @desc    Create new subject
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), validateSubject, createSubject);

// @route   PUT /api/subjects/:id
// @desc    Update subject
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), validateUUID, validateSubject, updateSubject);

// @route   DELETE /api/subjects/:id
// @desc    Delete subject
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), validateUUID, deleteSubject);

module.exports = router;
