const { BulkSMS, Message, Notification, User, Student, Teacher, Parent } = require('../models');
const { Op } = require('sequelize');

// Bulk SMS Management
const getBulkSMS = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', recipientType = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      whereClause.status = status;
    }
    if (recipientType) {
      whereClause.recipientType = recipientType;
    }

    const { count, rows: bulkSMS } = await BulkSMS.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: bulkSMS,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBulkSMS = async (req, res) => {
  try {
    const bulkSMS = await BulkSMS.create(req.body);
    res.status(201).json({ success: true, data: bulkSMS });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const sendBulkSMS = async (req, res) => {
  try {
    const { id } = req.params;
    const bulkSMS = await BulkSMS.findByPk(id);
    
    if (!bulkSMS) {
      return res.status(404).json({ success: false, message: 'Bulk SMS not found' });
    }

    // Update status to sending
    await bulkSMS.update({ status: 'sending' });

    // Here you would integrate with actual SMS service
    // For demo purposes, we'll simulate sending
    setTimeout(async () => {
      await bulkSMS.update({ 
        status: 'sent', 
        sentAt: new Date(),
        sentCount: bulkSMS.totalRecipients,
        failedCount: 0
      });
    }, 2000);

    res.json({ success: true, message: 'SMS sending initiated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Message Management
const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', messageType = '', priority = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { subject: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (messageType) {
      whereClause.messageType = messageType;
    }
    if (priority) {
      whereClause.priority = priority;
    }

    const { count, rows: messages } = await Message.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'recipient', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: messages,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMessage = async (req, res) => {
  try {
    const message = await Message.create(req.body);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Notification Management
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', type = '', priority = '', targetRole = '' } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { message: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (type) {
      whereClause.type = type;
    }
    if (priority) {
      whereClause.priority = priority;
    }
    if (targetRole) {
      whereClause.targetRole = targetRole;
    }

    const { count, rows: notifications } = await Notification.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createNotification = async (req, res) => {
  try {
    const notification = await Notification.create(req.body);
    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Bulk SMS Management
  getBulkSMS,
  createBulkSMS,
  sendBulkSMS,
  
  // Message Management
  getMessages,
  createMessage,
  
  // Notification Management
  getNotifications,
  createNotification
};
