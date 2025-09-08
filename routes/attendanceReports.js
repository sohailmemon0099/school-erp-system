const express = require('express');
const router = express.Router();
const attendanceReportController = require('../controllers/attendanceReportController');
const { protect: auth } = require('../middleware/auth');
const { validateAttendanceReport } = require('../middleware/validation');

// Attendance Report routes
router.get('/', auth, attendanceReportController.getAttendanceReports);
router.get('/stats', auth, attendanceReportController.getAttendanceReportStats);
router.get('/:id', auth, attendanceReportController.getAttendanceReportById);
router.post('/generate', auth, validateAttendanceReport, attendanceReportController.generateAttendanceReport);
router.put('/:id', auth, attendanceReportController.updateAttendanceReport);
router.delete('/:id', auth, attendanceReportController.deleteAttendanceReport);
router.get('/:id/export', auth, attendanceReportController.exportAttendanceReport);

module.exports = router;
