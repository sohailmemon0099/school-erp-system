const express = require('express');
const router = express.Router();
const communicationController = require('../controllers/communicationController');
const auth = require('../middleware/auth');
const { validateBulkSMS, validateMessage, validateNotification } = require('../middleware/validation');

// Bulk SMS Routes
router.get('/bulk-sms', auth.protect, communicationController.getBulkSMS);
router.post('/bulk-sms', auth.protect, validateBulkSMS, communicationController.createBulkSMS);
router.post('/bulk-sms/:id/send', auth.protect, communicationController.sendBulkSMS);

// Message Routes
router.get('/messages', auth.protect, communicationController.getMessages);
router.post('/messages', auth.protect, validateMessage, communicationController.createMessage);

// Notification Routes
router.get('/notifications', auth.protect, communicationController.getNotifications);
router.post('/notifications', auth.protect, validateNotification, communicationController.createNotification);

module.exports = router;
