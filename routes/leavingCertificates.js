const express = require('express');
const router = express.Router();
const {
  createLeavingCertificate,
  getLeavingCertificates,
  getLeavingCertificateById,
  updateLeavingCertificate,
  deleteLeavingCertificate,
  issueLeavingCertificate,
  getCertificateStats
} = require('../controllers/leavingCertificateController');
const { protect, authorize } = require('../middleware/auth');
const { validateUUID, validatePagination } = require('../middleware/validation');
const { validateLeavingCertificate, validateLeavingCertificateUpdate } = require('../middleware/validation');

// Apply authentication and authorization to all routes
router.use(protect);
router.use(authorize(['admin', 'teacher']));

// Certificate statistics
router.get('/stats', getCertificateStats);

// CRUD operations
router.post('/', validateLeavingCertificate, createLeavingCertificate);
router.get('/', validatePagination, getLeavingCertificates);
router.get('/:id', validateUUID, getLeavingCertificateById);
router.put('/:id', validateUUID, validateLeavingCertificateUpdate, updateLeavingCertificate);
router.delete('/:id', validateUUID, deleteLeavingCertificate);

// Issue certificate
router.post('/:id/issue', validateUUID, issueLeavingCertificate);

module.exports = router;
