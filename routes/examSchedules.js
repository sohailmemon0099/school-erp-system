const express = require('express');
const router = express.Router();
const examScheduleController = require('../controllers/examScheduleController');
const auth = require('../middleware/auth');
const { validateExamSchedule } = require('../middleware/validation');

// Get all exam schedules
router.get('/', auth.protect, examScheduleController.getExamSchedules);

// Get exam schedule by ID
router.get('/:id', auth.protect, examScheduleController.getExamScheduleById);

// Create new exam schedule
router.post('/', auth.protect, validateExamSchedule, examScheduleController.createExamSchedule);

// Update exam schedule
router.put('/:id', auth.protect, validateExamSchedule, examScheduleController.updateExamSchedule);

// Delete exam schedule
router.delete('/:id', auth.protect, examScheduleController.deleteExamSchedule);

// Get exam schedules by exam
router.get('/exam/:examId', auth.protect, examScheduleController.getExamSchedulesByExam);

// Get exam schedules by class
router.get('/class/:classId', auth.protect, examScheduleController.getExamSchedulesByClass);

module.exports = router;
