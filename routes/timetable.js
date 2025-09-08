const express = require('express');
const router = express.Router();
const {
  getAllTimetables,
  getTimetableById,
  getTimetableByClass,
  getTimetableByTeacher,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getAvailableSlots
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/auth');
const { validateTimetable, validateTimetableUpdate } = require('../middleware/validation');

// Apply authentication to all routes
router.use(protect);

// Get all timetable entries (Admin/Teacher only)
router.get('/', authorize('admin', 'teacher'), getAllTimetables);

// Get available time slots (Admin/Teacher only)
router.get('/available-slots', authorize('admin', 'teacher'), getAvailableSlots);

// Get timetable by ID (Admin/Teacher only)
router.get('/:id', authorize('admin', 'teacher'), getTimetableById);

// Get timetable by class (Admin/Teacher/Student)
router.get('/class/:classId', getTimetableByClass);

// Get timetable by teacher (Admin/Teacher only)
router.get('/teacher/:teacherId', authorize('admin', 'teacher'), getTimetableByTeacher);

// Create new timetable entry (Admin/Teacher only)
router.post('/', authorize('admin', 'teacher'), validateTimetable, createTimetable);

// Update timetable entry (Admin/Teacher only)
router.put('/:id', authorize('admin', 'teacher'), validateTimetableUpdate, updateTimetable);

// Delete timetable entry (Admin only)
router.delete('/:id', authorize('admin'), deleteTimetable);

module.exports = router;