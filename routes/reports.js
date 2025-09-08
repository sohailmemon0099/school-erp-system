const express = require('express');
const router = express.Router();
const {
  generateStudentReport,
  generateAllStudentsReport,
  generateClassReport,
  generateAttendanceReport,
  generateFeeReport,
  getDashboardStats
} = require('../controllers/reportsController');
const { protect, authorize } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');

// @route   GET /api/reports/student/:id
// @desc    Generate student report
// @access  Private
router.get('/student/:id', protect, validateUUID, generateStudentReport);

// @route   GET /api/reports/class/:id
// @desc    Generate class report
// @access  Private
router.get('/class/:id', protect, validateUUID, generateClassReport);

// @route   GET /api/reports/attendance
// @desc    Generate attendance report
// @access  Private
router.get('/attendance', protect, generateAttendanceReport);

// @route   GET /api/reports/fees
// @desc    Generate fee report
// @access  Private
router.get('/fees', protect, generateFeeReport);

// @route   GET /api/reports/dashboard-stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/dashboard-stats', protect, getDashboardStats);

// @route   GET /api/reports/students
// @desc    Generate students report
// @access  Private
router.get('/students', protect, generateAllStudentsReport);

module.exports = router;
