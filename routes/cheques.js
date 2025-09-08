const express = require('express');
const router = express.Router();
const chequeController = require('../controllers/chequeController');
const { protect: auth } = require('../middleware/auth');
const { validateCheque } = require('../middleware/validation');

// Cheque routes
router.get('/', auth, chequeController.getCheques);
router.get('/stats', auth, chequeController.getChequeStats);
router.get('/pending', auth, chequeController.getPendingCheques);
router.get('/:id', auth, chequeController.getChequeById);
router.post('/', auth, validateCheque, chequeController.createCheque);
router.put('/:id/status', auth, chequeController.updateChequeStatus);
router.delete('/:id', auth, chequeController.deleteCheque);
router.post('/validate', auth, chequeController.validateCheque);

module.exports = router;
