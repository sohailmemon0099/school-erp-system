const express = require('express');
const router = express.Router();
const {
  createClasswork,
  getClassworks,
  getClassworkById,
  updateClasswork,
  deleteClasswork,
  submitClasswork,
  gradeSubmission,
  getClassworkStats
} = require('../controllers/classworkController');
const { protect, authorize } = require('../middleware/auth');
const { validateClasswork, validateClassworkUpdate, validateSubmission, validateGrading } = require('../middleware/validation');
const { validateUUID, validatePagination } = require('../middleware/validation');

// All routes are protected
router.use(protect);

// Classwork management routes (admin/teacher only)
router.post('/', authorize(['admin', 'teacher']), validateClasswork, createClasswork);
router.get('/', validatePagination, getClassworks);
router.get('/stats', authorize(['admin', 'teacher']), getClassworkStats);
router.get('/:id', validateUUID, getClassworkById);
router.put('/:id', authorize(['admin', 'teacher']), validateUUID, validateClassworkUpdate, updateClasswork);
router.delete('/:id', authorize(['admin', 'teacher']), validateUUID, deleteClasswork);

// Submission routes
router.post('/:classworkId/submit', authorize(['student']), validateSubmission, submitClasswork);

// Grading routes (teacher/admin only)
router.put('/submissions/:submissionId/grade', authorize(['admin', 'teacher']), validateUUID, validateGrading, gradeSubmission);

module.exports = router;
