const express = require('express');
const router = express.Router();
const {
  getClassTeacherAssignments,
  getTeacherAssignments,
  getClassAssignments,
  createClassTeacherAssignment,
  updateClassTeacherAssignment,
  deleteClassTeacherAssignment,
  bulkCreateClassTeacherAssignments
} = require('../controllers/classTeacherAssignmentController');
const { protect, authorize } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permission');
// const {
//   validateClassTeacherAssignment,
//   validateBulkClassTeacherAssignment
// } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// @route   GET /api/class-teacher-assignments
// @desc    Get all class-teacher assignments
// @access  Private (Admin)
router.get(
  '/',
  checkPermission('user_management', 'view'),
  getClassTeacherAssignments
);

// @route   GET /api/class-teacher-assignments/teacher/:teacherId
// @desc    Get assignments for a specific teacher
// @access  Private (Admin, Teacher)
router.get(
  '/teacher/:teacherId',
  checkPermission('user_management', 'view'),
  getTeacherAssignments
);

// @route   GET /api/class-teacher-assignments/class/:classId
// @desc    Get assignments for a specific class
// @access  Private (Admin)
router.get(
  '/class/:classId',
  checkPermission('user_management', 'view'),
  getClassAssignments
);

// @route   POST /api/class-teacher-assignments
// @desc    Create class-teacher assignment
// @access  Private (Admin)
router.post(
  '/',
  checkPermission('user_management', 'create'),
  // validateClassTeacherAssignment,
  createClassTeacherAssignment
);

// @route   POST /api/class-teacher-assignments/bulk
// @desc    Bulk create class-teacher assignments
// @access  Private (Admin)
router.post(
  '/bulk',
  checkPermission('user_management', 'create'),
  // validateBulkClassTeacherAssignment,
  bulkCreateClassTeacherAssignments
);

// @route   PUT /api/class-teacher-assignments/:id
// @desc    Update class-teacher assignment
// @access  Private (Admin)
router.put(
  '/:id',
  checkPermission('user_management', 'update'),
  updateClassTeacherAssignment
);

// @route   DELETE /api/class-teacher-assignments/:id
// @desc    Delete class-teacher assignment
// @access  Private (Admin)
router.delete(
  '/:id',
  checkPermission('user_management', 'delete'),
  deleteClassTeacherAssignment
);

module.exports = router;
