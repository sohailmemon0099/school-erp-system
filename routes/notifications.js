const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getNotificationStats
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/notifications
// @desc    Get notifications for current user
// @access  Private
router.get('/', protect, getNotifications);

// @route   GET /api/notifications/stats
// @desc    Get notification statistics
// @access  Private
router.get('/stats', protect, getNotificationStats);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, markAsRead);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, markAllAsRead);

// @route   POST /api/notifications
// @desc    Create notification (Admin only)
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), createNotification);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification (Admin only)
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;
