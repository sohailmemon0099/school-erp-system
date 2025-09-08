const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { protect: auth } = require('../middleware/auth');
const { validateExam, validateExamUpdate, validateExamSchedule } = require('../middleware/validation');

// Exam routes
router.get('/', auth, examController.getExams);
router.get('/stats', auth, examController.getExamStats);
router.get('/:id', auth, examController.getExamById);
router.post('/', auth, validateExam, examController.createExam);
router.put('/:id', auth, validateExamUpdate, examController.updateExam);
router.delete('/:id', auth, examController.deleteExam);

// Exam Schedule routes
router.post('/schedules', auth, validateExamSchedule, examController.createExamSchedule);
router.get('/schedules/list', auth, examController.getExamSchedules);

// Hall Ticket routes
router.post('/hall-tickets/generate', auth, examController.generateHallTickets);
router.get('/hall-tickets/list', auth, examController.getHallTickets);

module.exports = router;
