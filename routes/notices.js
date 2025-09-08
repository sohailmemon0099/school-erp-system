const express = require('express');
const router = express.Router();
const noticeController = require('../controllers/noticeController');
const { protect: auth } = require('../middleware/auth');
const { validateNotice } = require('../middleware/validation');

// Notice routes
router.get('/', auth, noticeController.getNotices);
router.get('/public', noticeController.getPublicNotices);
router.get('/stats', auth, noticeController.getNoticeStats);
router.get('/:id', auth, noticeController.getNoticeById);
router.post('/', auth, validateNotice, noticeController.createNotice);
router.put('/:id', auth, noticeController.updateNotice);
router.put('/:id/publish', auth, noticeController.publishNotice);
router.delete('/:id', auth, noticeController.deleteNotice);

module.exports = router;

