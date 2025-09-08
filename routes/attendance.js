const express = require('express');
const router = express.Router();
const {
  getAttendance,
  getAttendanceRecord,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  bulkCreateAttendance,
  getAttendanceStats,
  getTeacherClasses,
  getStudentsByClass,
  markClassAttendance,
  updateClassAttendance,
  getClassAttendanceReport
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateAttendance,
  validateUUID,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/attendance
// @desc    Get all attendance records
// @access  Private
router.get('/', protect, validatePagination, getAttendance);

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private
router.get('/stats', protect, getAttendanceStats);

// @route   GET /api/attendance/teacher-classes
// @desc    Get classes accessible to teacher for attendance
// @access  Private (Teacher, Admin)
router.get('/teacher-classes', protect, authorize('teacher', 'admin'), getTeacherClasses);

// @route   GET /api/attendance/:id
// @desc    Get single attendance record
// @access  Private
router.get('/:id', protect, validateUUID, getAttendanceRecord);

// @route   POST /api/attendance
// @desc    Create attendance record
// @access  Private (Teacher, Admin)
router.post('/', protect, authorize('teacher', 'admin'), validateAttendance, createAttendance);

// @route   POST /api/attendance/bulk
// @desc    Bulk create attendance records
// @access  Private (Teacher, Admin)
router.post('/bulk', protect, authorize('teacher', 'admin'), bulkCreateAttendance);

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Teacher, Admin)
router.put('/:id', protect, authorize('teacher', 'admin'), validateUUID, updateAttendance);

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), validateUUID, deleteAttendance);

// @route   GET /api/attendance/class/:classId/students
// @desc    Get students by class for attendance marking
// @access  Private (Teacher, Admin)
router.get('/class/:classId/students', protect, authorize('teacher', 'admin'), getStudentsByClass);

// @route   POST /api/attendance/class/:classId/mark
// @desc    Mark attendance for entire class
// @access  Private (Teacher, Admin)
router.post('/class/:classId/mark', protect, authorize('teacher', 'admin'), markClassAttendance);

// @route   PUT /api/attendance/class/:classId/update
// @desc    Update attendance for entire class
// @access  Private (Teacher, Admin)
router.put('/class/:classId/update', protect, authorize('teacher', 'admin'), updateClassAttendance);

// @route   GET /api/attendance/class/:classId/report
// @desc    Get attendance report for a class
// @access  Private
router.get('/class/:classId/report', protect, getClassAttendanceReport);

module.exports = router;
