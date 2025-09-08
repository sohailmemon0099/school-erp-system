const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  createStudentWithUser,
  updateStudent,
  deleteStudent,
  getStudentGrades,
  getStudentAttendance,
  getStudentFees,
  getStudentStats
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateStudent,
  validateStudentWithUser,
  validateStudentUpdate,
  validateUUID,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/students
// @desc    Get all students
// @access  Private (Admin, Teacher)
router.get('/', protect, authorize('admin', 'teacher'), validatePagination, getStudents);

// @route   GET /api/students/:id
// @desc    Get single student
// @access  Private
router.get('/:id', protect, validateUUID, getStudent);

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), validateStudent, createStudent);

// @route   POST /api/students/with-user
// @desc    Create new student with user data
// @access  Private (Admin)
router.post('/with-user', protect, authorize('admin'), validateStudentWithUser, createStudentWithUser);

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), validateUUID, validateStudentUpdate, updateStudent);

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), validateUUID, deleteStudent);

// @route   GET /api/students/:id/grades
// @desc    Get student grades
// @access  Private
router.get('/:id/grades', protect, validateUUID, getStudentGrades);

// @route   GET /api/students/:id/attendance
// @desc    Get student attendance
// @access  Private
router.get('/:id/attendance', protect, validateUUID, getStudentAttendance);

// @route   GET /api/students/:id/fees
// @desc    Get student fees
// @access  Private
router.get('/:id/fees', protect, validateUUID, getStudentFees);

// @route   GET /api/students/:id/stats
// @desc    Get student statistics
// @access  Private
router.get('/:id/stats', protect, validateUUID, getStudentStats);

module.exports = router;
