const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { protect: auth } = require('../middleware/auth');
const { validateEvent } = require('../middleware/validation');

// Event routes
router.get('/', auth, eventController.getEvents);
router.get('/upcoming', auth, eventController.getUpcomingEvents);
router.get('/stats', auth, eventController.getEventStats);
router.get('/:id', auth, eventController.getEventById);
router.post('/', auth, validateEvent, eventController.createEvent);
router.put('/:id', auth, eventController.updateEvent);
router.put('/:id/status', auth, eventController.updateEventStatus);
router.delete('/:id', auth, eventController.deleteEvent);

module.exports = router;

