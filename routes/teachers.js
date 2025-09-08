const express = require('express');
const router = express.Router();
const {
  getTeachers,
  getTeacher,
  createTeacher,
  createTeacherWithUser,
  updateTeacher,
  deleteTeacher,
  assignClasses,
  assignSubjects
} = require('../controllers/teacherController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateTeacher,
  validateTeacherWithUser,
  validateTeacherUpdate,
  validateUUID,
  validatePagination
} = require('../middleware/validation');

// @route   GET /api/teachers
// @desc    Get all teachers
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), validatePagination, getTeachers);

// @route   GET /api/teachers/:id
// @desc    Get single teacher
// @access  Private
router.get('/:id', protect, validateUUID, getTeacher);

// @route   POST /api/teachers
// @desc    Create new teacher
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), validateTeacher, createTeacher);

// @route   POST /api/teachers/with-user
// @desc    Create new teacher with user data
// @access  Private (Admin)
router.post('/with-user', protect, authorize('admin'), validateTeacherWithUser, createTeacherWithUser);

// @route   PUT /api/teachers/:id
// @desc    Update teacher
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), validateUUID, validateTeacherUpdate, updateTeacher);

// @route   DELETE /api/teachers/:id
// @desc    Delete teacher
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), validateUUID, deleteTeacher);

// @route   POST /api/teachers/:id/assign-classes
// @desc    Assign teacher to classes
// @access  Private (Admin)
router.post('/:id/assign-classes', protect, authorize('admin'), validateUUID, assignClasses);

// @route   POST /api/teachers/:id/assign-subjects
// @desc    Assign teacher to subjects
// @access  Private (Admin)
router.post('/:id/assign-subjects', protect, authorize('admin'), validateUUID, assignSubjects);

module.exports = router;
