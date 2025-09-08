const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const auth = require('../middleware/auth');
const { validateBonafideCertificate, validateLeavingCertificate, validateAffidavit } = require('../middleware/validation');

// Bonafide Certificate Routes
router.get('/bonafide', auth.protect, certificateController.getBonafideCertificates);
router.post('/bonafide', auth.protect, validateBonafideCertificate, certificateController.createBonafideCertificate);
router.put('/bonafide/:id', auth.protect, validateBonafideCertificate, certificateController.updateBonafideCertificate);

// Leaving Certificate Routes
router.get('/leaving', auth.protect, certificateController.getLeavingCertificates);
router.post('/leaving', auth.protect, validateLeavingCertificate, certificateController.createLeavingCertificate);

// Affidavit Routes
router.get('/affidavits', auth.protect, certificateController.getAffidavits);
router.post('/affidavits', auth.protect, validateAffidavit, certificateController.createAffidavit);

module.exports = router;
