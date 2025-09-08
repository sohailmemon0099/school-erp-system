const express = require('express');
const router = express.Router();
const transportController = require('../controllers/transportController');
const auth = require('../middleware/auth');
const { validateVehicle, validateTransportFee, validateTransportPayment } = require('../middleware/validation');

// Vehicle Management Routes
router.get('/vehicles', auth.protect, transportController.getVehicles);
router.post('/vehicles', auth.protect, validateVehicle, transportController.createVehicle);
router.put('/vehicles/:id', auth.protect, validateVehicle, transportController.updateVehicle);
router.delete('/vehicles/:id', auth.protect, transportController.deleteVehicle);

// Transport Fee Management Routes
router.get('/fees', auth.protect, transportController.getTransportFees);
router.post('/fees', auth.protect, validateTransportFee, transportController.createTransportFee);

// Transport Payment Management Routes
router.get('/payments', auth.protect, transportController.getTransportPayments);
router.post('/payments', auth.protect, validateTransportPayment, transportController.createTransportPayment);

module.exports = router;
