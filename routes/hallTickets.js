const express = require('express');
const router = express.Router();
const hallTicketController = require('../controllers/hallTicketController');
const auth = require('../middleware/auth');
const { validateHallTicket } = require('../middleware/validation');

// Get all hall tickets
router.get('/', auth.protect, hallTicketController.getHallTickets);

// Get hall ticket by ID
router.get('/:id', auth.protect, hallTicketController.getHallTicketById);

// Create new hall ticket
router.post('/', auth.protect, validateHallTicket, hallTicketController.createHallTicket);

// Update hall ticket
router.put('/:id', auth.protect, validateHallTicket, hallTicketController.updateHallTicket);

// Delete hall ticket
router.delete('/:id', auth.protect, hallTicketController.deleteHallTicket);

// Generate hall tickets for exam
router.post('/generate', auth.protect, hallTicketController.generateHallTicketsForExam);

// Get hall tickets by student
router.get('/student/:studentId', auth.protect, hallTicketController.getHallTicketsByStudent);

module.exports = router;
