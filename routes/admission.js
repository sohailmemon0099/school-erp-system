const express = require('express');
const router = express.Router();
const admissionController = require('../controllers/admissionController');
const auth = require('../middleware/auth');
const { validateInquiry } = require('../middleware/validation');

// Inquiry Management Routes
router.get('/inquiries', auth.protect, admissionController.getInquiries);
router.post('/inquiries', auth.protect, validateInquiry, admissionController.createInquiry);
router.put('/inquiries/:id', auth.protect, validateInquiry, admissionController.updateInquiry);
router.delete('/inquiries/:id', auth.protect, admissionController.deleteInquiry);

// Follow-up Management Routes
router.get('/follow-ups', auth.protect, admissionController.getFollowUps);
router.post('/follow-ups', auth.protect, admissionController.createFollowUp);

// Reports Routes
router.get('/funnel-report', auth.protect, admissionController.getAdmissionFunnelReport);

module.exports = router;
