const express = require('express');
const router = express.Router();
const healthController = require('../controllers/healthController');
const auth = require('../middleware/auth');

// Health Record Routes
router.get('/records', auth.protect, healthController.getHealthRecords);
router.post('/records', auth.protect, healthController.createHealthRecord);

// Vaccination Routes
router.get('/vaccinations', auth.protect, healthController.getVaccinations);
router.post('/vaccinations', auth.protect, healthController.createVaccination);

// Emergency Contact Routes
router.get('/emergency-contacts', auth.protect, healthController.getEmergencyContacts);

module.exports = router;
