const express = require('express');
const router = express.Router();
const {
  createBonafideCertificate,
  getBonafideCertificates,
  getBonafideCertificateById,
  updateBonafideCertificate,
  deleteBonafideCertificate,
  issueBonafideCertificate,
  getCertificateStats
} = require('../controllers/bonafideCertificateController');
const { protect, authorize } = require('../middleware/auth');
const { validateUUID, validatePagination } = require('../middleware/validation');
const { validateBonafideCertificate, validateBonafideCertificateUpdate } = require('../middleware/validation');

// Apply authentication and authorization to all routes
router.use(protect);
router.use(authorize(['admin', 'teacher']));

// Certificate statistics
router.get('/stats', getCertificateStats);

// CRUD operations
router.post('/', validateBonafideCertificate, createBonafideCertificate);
router.get('/', validatePagination, getBonafideCertificates);
router.get('/:id', validateUUID, getBonafideCertificateById);
router.put('/:id', validateUUID, validateBonafideCertificateUpdate, updateBonafideCertificate);
router.delete('/:id', validateUUID, deleteBonafideCertificate);

// Issue certificate
router.post('/:id/issue', validateUUID, issueBonafideCertificate);

module.exports = router;
