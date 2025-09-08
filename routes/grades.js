const express = require('express');
const router = express.Router();
const {
  getGrades,
  getGrade,
  createGrade,
  updateGrade,
  deleteGrade,
  getGradeStats
} = require('../controllers/gradeController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateGrade,
  validateUUID,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/grades
// @desc    Get all grades
// @access  Private
router.get('/', protect, validatePagination, getGrades);

// @route   GET /api/grades/stats
// @desc    Get grade statistics
// @access  Private
router.get('/stats', protect, getGradeStats);

// @route   GET /api/grades/:id
// @desc    Get single grade
// @access  Private
router.get('/:id', protect, validateUUID, getGrade);

// @route   POST /api/grades
// @desc    Create grade
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), validateGrade, createGrade);

// @route   PUT /api/grades/:id
// @desc    Update grade
// @access  Private (Teacher, Admin)
router.put('/:id', protect, authorize('teacher', 'admin'), validateUUID, updateGrade);

// @route   DELETE /api/grades/:id
// @desc    Delete grade
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), validateUUID, deleteGrade);

module.exports = router;
