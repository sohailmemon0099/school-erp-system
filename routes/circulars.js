const express = require('express');
const router = express.Router();
const circularController = require('../controllers/circularController');
const { protect: auth } = require('../middleware/auth');
const { validateCircular } = require('../middleware/validation');

// Circular routes
router.get('/', auth, circularController.getCirculars);
router.get('/public', circularController.getPublicCirculars);
router.get('/stats', auth, circularController.getCircularStats);
router.get('/:id', auth, circularController.getCircularById);
router.post('/', auth, validateCircular, circularController.createCircular);
router.put('/:id', auth, circularController.updateCircular);
router.put('/:id/publish', auth, circularController.publishCircular);
router.put('/:id/acknowledge', auth, circularController.acknowledgeCircular);
router.delete('/:id', auth, circularController.deleteCircular);

module.exports = router;

