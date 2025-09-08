const express = require('express');
const router = express.Router();
const transactionLogController = require('../controllers/transactionLogController');
const { protect: auth } = require('../middleware/auth');
const { validateTransactionLog } = require('../middleware/validation');

// Transaction Log routes
router.get('/', auth, transactionLogController.getTransactionLogs);
router.get('/stats', auth, transactionLogController.getTransactionStats);
router.get('/export', auth, transactionLogController.exportTransactionLogs);
router.get('/:id', auth, transactionLogController.getTransactionLogById);
router.post('/', auth, validateTransactionLog, transactionLogController.createTransactionLog);
router.put('/:id/status', auth, transactionLogController.updateTransactionStatus);

module.exports = router;
