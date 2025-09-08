const Notification = require('../models/Notification');
const User = require('../models/User');
const Student = require('../models/Student');
const { Op } = require('sequelize');

// @desc    Get notifications for current user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, unreadOnly = false } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      isActive: true,
      [Op.or]: [
        { targetType: 'all' },
        { targetType: 'role', targetRole: req.user.role },
        { targetType: 'user', targetId: req.user.id }
      ]
    };

    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      status: 'success',
      data: {
        notifications: notifications.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(notifications.count / limit),
          totalItems: notifications.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching notifications'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    await notification.update({
      isRead: true,
      readAt: new Date()
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating notification'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      {
        isRead: true,
        readAt: new Date()
      },
      {
        where: {
          isActive: true,
          isRead: false,
          [Op.or]: [
            { targetType: 'all' },
            { targetType: 'role', targetRole: req.user.role },
            { targetType: 'user', targetId: req.user.id }
          ]
        }
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating notifications'
    });
  }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private (Admin)
const createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type = 'info',
      priority = 'medium',
      targetType = 'all',
      targetId,
      targetRole,
      expiresAt
    } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type,
      priority,
      targetType,
      targetId,
      targetRole,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    res.status(201).json({
      status: 'success',
      message: 'Notification created successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating notification'
    });
  }
};

// @desc    Delete notification (Admin only)
// @route   DELETE /api/notifications/:id
// @access  Private (Admin)
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: 'error',
        message: 'Notification not found'
      });
    }

    await notification.update({ isActive: false });

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting notification'
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
const getNotificationStats = async (req, res) => {
  try {
    const whereClause = {
      isActive: true,
      [Op.or]: [
        { targetType: 'all' },
        { targetType: 'role', targetRole: req.user.role },
        { targetType: 'user', targetId: req.user.id }
      ]
    };

    const [total, unread, urgent] = await Promise.all([
      Notification.count({ where: whereClause }),
      Notification.count({ where: { ...whereClause, isRead: false } }),
      Notification.count({ where: { ...whereClause, priority: 'urgent', isRead: false } })
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        total,
        unread,
        urgent
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching notification statistics'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getNotificationStats
};
