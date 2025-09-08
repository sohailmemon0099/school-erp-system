const { Notice, User, Class, Student, NoticeView } = require('../models');
const { Op } = require('sequelize');

// Generate unique notice ID
const generateNoticeId = (type) => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${type.toUpperCase()}_${timestamp}_${random}`;
};

// Get all notices
const getNotices = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, priority, status, targetAudience, academicYear, isSticky, isImportant } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { noticeId: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (type) where.type = type;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (targetAudience) where.targetAudience = targetAudience;
    if (academicYear) where.academicYear = academicYear;
    if (isSticky !== undefined) where.isSticky = isSticky === 'true';
    if (isImportant !== undefined) where.isImportant = isImportant === 'true';

    // Filter by expiry date
    where[Op.or] = [
      { expiryDate: null },
      { expiryDate: { [Op.gte]: new Date() } }
    ];

    const { count, rows: notices } = await Notice.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [
        ['isSticky', 'DESC'],
        ['isImportant', 'DESC'],
        ['priority', 'DESC'],
        ['publishDate', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        notices,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch notices' });
  }
};

// Get notice by ID
const getNoticeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notice = await Notice.findByPk(id, {
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!notice) {
      return res.status(404).json({ status: 'error', message: 'Notice not found' });
    }

    // Increment view count
    await notice.increment('viewCount');

    // Record view
    try {
      await NoticeView.create({
        noticeId: notice.id,
        userId: req.user.id,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    } catch (viewError) {
      // Ignore duplicate view errors
      console.log('View already recorded for this user');
    }

    res.json({ status: 'success', data: { notice } });
  } catch (error) {
    console.error('Error fetching notice:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch notice' });
  }
};

// Create notice
const createNotice = async (req, res) => {
  try {
    const {
      title,
      content,
      type,
      priority,
      targetAudience,
      classId,
      studentId,
      academicYear,
      publishDate,
      expiryDate,
      isSticky,
      isImportant,
      attachments,
      tags
    } = req.body;

    const noticeId = generateNoticeId(type);

    const notice = await Notice.create({
      noticeId,
      title,
      content,
      type,
      priority,
      targetAudience,
      classId,
      studentId,
      academicYear,
      publishDate: publishDate ? new Date(publishDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      isSticky: isSticky || false,
      isImportant: isImportant || false,
      attachments,
      tags,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Notice created successfully',
      data: { notice }
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create notice' });
  }
};

// Update notice
const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({ status: 'error', message: 'Notice not found' });
    }

    // Convert date strings to Date objects
    if (updateData.publishDate) {
      updateData.publishDate = new Date(updateData.publishDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    await notice.update(updateData);

    res.json({
      status: 'success',
      message: 'Notice updated successfully',
      data: { notice }
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update notice' });
  }
};

// Delete notice
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({ status: 'error', message: 'Notice not found' });
    }

    await notice.destroy();

    res.json({ status: 'success', message: 'Notice deleted successfully' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete notice' });
  }
};

// Publish notice
const publishNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({ status: 'error', message: 'Notice not found' });
    }

    await notice.update({
      status: 'published',
      publishDate: new Date()
    });

    res.json({
      status: 'success',
      message: 'Notice published successfully',
      data: { notice }
    });
  } catch (error) {
    console.error('Error publishing notice:', error);
    res.status(500).json({ status: 'error', message: 'Failed to publish notice' });
  }
};

// Get notice statistics
const getNoticeStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;

    const totalNotices = await Notice.count({ where });
    const publishedNotices = await Notice.count({ where: { ...where, status: 'published' } });
    const draftNotices = await Notice.count({ where: { ...where, status: 'draft' } });
    const archivedNotices = await Notice.count({ where: { ...where, status: 'archived' } });
    const expiredNotices = await Notice.count({ where: { ...where, status: 'expired' } });
    const stickyNotices = await Notice.count({ where: { ...where, isSticky: true } });
    const importantNotices = await Notice.count({ where: { ...where, isImportant: true } });

    // Get type-wise statistics
    const typeStats = await Notice.findAll({
      where,
      attributes: [
        'type',
        [Notice.sequelize.fn('COUNT', Notice.sequelize.col('id')), 'count']
      ],
      group: ['type'],
      order: [[Notice.sequelize.fn('COUNT', Notice.sequelize.col('id')), 'DESC']]
    });

    // Get priority-wise statistics
    const priorityStats = await Notice.findAll({
      where,
      attributes: [
        'priority',
        [Notice.sequelize.fn('COUNT', Notice.sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      order: [[Notice.sequelize.fn('COUNT', Notice.sequelize.col('id')), 'DESC']]
    });

    // Get recent notices
    const recentNotices = await Notice.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get most viewed notices
    const mostViewedNotices = await Notice.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName'] }
      ],
      order: [['viewCount', 'DESC']],
      limit: 5
    });

    res.json({
      status: 'success',
      data: {
        totalNotices,
        publishedNotices,
        draftNotices,
        archivedNotices,
        expiredNotices,
        stickyNotices,
        importantNotices,
        typeStats,
        priorityStats,
        recentNotices,
        mostViewedNotices
      }
    });
  } catch (error) {
    console.error('Error fetching notice stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch notice statistics' });
  }
};

// Get public notices (for students/parents)
const getPublicNotices = async (req, res) => {
  try {
    const { limit = 20, type, priority } = req.query;

    const where = {
      status: 'published',
      [Op.or]: [
        { expiryDate: null },
        { expiryDate: { [Op.gte]: new Date() } }
      ]
    };

    if (type) where.type = type;
    if (priority) where.priority = priority;

    const notices = await Notice.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName'] }
      ],
      order: [
        ['isSticky', 'DESC'],
        ['isImportant', 'DESC'],
        ['priority', 'DESC'],
        ['publishDate', 'DESC']
      ],
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: { notices }
    });
  } catch (error) {
    console.error('Error fetching public notices:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch public notices' });
  }
};

module.exports = {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
  publishNotice,
  getNoticeStats,
  getPublicNotices
};

