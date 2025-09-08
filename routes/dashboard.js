const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAttendanceChart,
  getGradeDistribution,
  getFeeCollection,
  getClassPerformance
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, getDashboardStats);

// @route   GET /api/dashboard/attendance-chart
// @desc    Get attendance chart data
// @access  Private
router.get('/attendance-chart', protect, getAttendanceChart);

// @route   GET /api/dashboard/grade-distribution
// @desc    Get grade distribution chart
// @access  Private
router.get('/grade-distribution', protect, getGradeDistribution);

// @route   GET /api/dashboard/fee-collection
// @desc    Get fee collection chart
// @access  Private
router.get('/fee-collection', protect, getFeeCollection);

// @route   GET /api/dashboard/class-performance
// @desc    Get class performance data
// @access  Private
router.get('/class-performance', protect, getClassPerformance);

module.exports = router;
