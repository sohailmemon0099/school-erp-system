const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,
  getClassStats
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateClass,
  validateUUID,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/classes
// @desc    Get all classes
// @access  Private
router.get('/', protect, validatePagination, getClasses);

// @route   GET /api/classes/:id
// @desc    Get single class
// @access  Private
router.get('/:id', protect, validateUUID, getClass);

// @route   POST /api/classes
// @desc    Create new class
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), validateClass, createClass);

// @route   PUT /api/classes/:id
// @desc    Update class
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), validateUUID, validateClass, updateClass);

// @route   DELETE /api/classes/:id
// @desc    Delete class
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), validateUUID, deleteClass);

// @route   GET /api/classes/:id/stats
// @desc    Get class statistics
// @access  Private
router.get('/:id/stats', protect, validateUUID, getClassStats);

module.exports = router;
