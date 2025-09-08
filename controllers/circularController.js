const { Circular, User, Class, Student, CircularAcknowledgment } = require('../models');
const { Op } = require('sequelize');

// Generate unique circular ID
const generateCircularId = (circularType) => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${circularType.toUpperCase()}_${timestamp}_${random}`;
};

// Get all circulars
const getCirculars = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, circularType, priority, status, targetAudience, academicYear, isSticky, isImportant, requiresAcknowledgment } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { circularId: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (circularType) where.circularType = circularType;
    if (priority) where.priority = priority;
    if (status) where.status = status;
    if (targetAudience) where.targetAudience = targetAudience;
    if (academicYear) where.academicYear = academicYear;
    if (isSticky !== undefined) where.isSticky = isSticky === 'true';
    if (isImportant !== undefined) where.isImportant = isImportant === 'true';
    if (requiresAcknowledgment !== undefined) where.requiresAcknowledgment = requiresAcknowledgment === 'true';

    // Filter by expiry date
    where[Op.or] = [
      { expiryDate: null },
      { expiryDate: { [Op.gte]: new Date() } }
    ];

    const { count, rows: circulars } = await Circular.findAndCountAll({
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
        circulars,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching circulars:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch circulars' });
  }
};

// Get circular by ID
const getCircularById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const circular = await Circular.findByPk(id, {
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!circular) {
      return res.status(404).json({ status: 'error', message: 'Circular not found' });
    }

    // Increment view count
    await circular.increment('viewCount');

    res.json({ status: 'success', data: { circular } });
  } catch (error) {
    console.error('Error fetching circular:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch circular' });
  }
};

// Create circular
const createCircular = async (req, res) => {
  try {
    const {
      title,
      content,
      circularType,
      priority,
      targetAudience,
      classId,
      studentId,
      academicYear,
      publishDate,
      expiryDate,
      effectiveDate,
      isSticky,
      isImportant,
      requiresAcknowledgment,
      acknowledgmentDeadline,
      attachments,
      tags
    } = req.body;

    const circularId = generateCircularId(circularType);

    const circular = await Circular.create({
      circularId,
      title,
      content,
      circularType,
      priority,
      targetAudience,
      classId,
      studentId,
      academicYear,
      publishDate: publishDate ? new Date(publishDate) : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
      isSticky: isSticky || false,
      isImportant: isImportant || false,
      requiresAcknowledgment: requiresAcknowledgment || false,
      acknowledgmentDeadline: acknowledgmentDeadline ? new Date(acknowledgmentDeadline) : null,
      attachments,
      tags,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Circular created successfully',
      data: { circular }
    });
  } catch (error) {
    console.error('Error creating circular:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create circular' });
  }
};

// Update circular
const updateCircular = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const circular = await Circular.findByPk(id);
    if (!circular) {
      return res.status(404).json({ status: 'error', message: 'Circular not found' });
    }

    // Convert date strings to Date objects
    if (updateData.publishDate) {
      updateData.publishDate = new Date(updateData.publishDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }
    if (updateData.effectiveDate) {
      updateData.effectiveDate = new Date(updateData.effectiveDate);
    }
    if (updateData.acknowledgmentDeadline) {
      updateData.acknowledgmentDeadline = new Date(updateData.acknowledgmentDeadline);
    }

    await circular.update(updateData);

    res.json({
      status: 'success',
      message: 'Circular updated successfully',
      data: { circular }
    });
  } catch (error) {
    console.error('Error updating circular:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update circular' });
  }
};

// Delete circular
const deleteCircular = async (req, res) => {
  try {
    const { id } = req.params;

    const circular = await Circular.findByPk(id);
    if (!circular) {
      return res.status(404).json({ status: 'error', message: 'Circular not found' });
    }

    await circular.destroy();

    res.json({ status: 'success', message: 'Circular deleted successfully' });
  } catch (error) {
    console.error('Error deleting circular:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete circular' });
  }
};

// Publish circular
const publishCircular = async (req, res) => {
  try {
    const { id } = req.params;

    const circular = await Circular.findByPk(id);
    if (!circular) {
      return res.status(404).json({ status: 'error', message: 'Circular not found' });
    }

    await circular.update({
      status: 'published',
      publishDate: new Date()
    });

    res.json({
      status: 'success',
      message: 'Circular published successfully',
      data: { circular }
    });
  } catch (error) {
    console.error('Error publishing circular:', error);
    res.status(500).json({ status: 'error', message: 'Failed to publish circular' });
  }
};

// Acknowledge circular
const acknowledgeCircular = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const circular = await Circular.findByPk(id);
    if (!circular) {
      return res.status(404).json({ status: 'error', message: 'Circular not found' });
    }

    if (!circular.requiresAcknowledgment) {
      return res.status(400).json({ status: 'error', message: 'This circular does not require acknowledgment' });
    }

    // Check if already acknowledged
    const existingAcknowledgment = await CircularAcknowledgment.findOne({
      where: {
        circularId: circular.id,
        userId: req.user.id
      }
    });

    if (existingAcknowledgment) {
      return res.status(400).json({ status: 'error', message: 'Circular already acknowledged' });
    }

    // Create acknowledgment
    await CircularAcknowledgment.create({
      circularId: circular.id,
      userId: req.user.id,
      comments,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Increment acknowledgment count
    await circular.increment('acknowledgmentCount');

    res.json({
      status: 'success',
      message: 'Circular acknowledged successfully'
    });
  } catch (error) {
    console.error('Error acknowledging circular:', error);
    res.status(500).json({ status: 'error', message: 'Failed to acknowledge circular' });
  }
};

// Get circular statistics
const getCircularStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;

    const totalCirculars = await Circular.count({ where });
    const publishedCirculars = await Circular.count({ where: { ...where, status: 'published' } });
    const draftCirculars = await Circular.count({ where: { ...where, status: 'draft' } });
    const archivedCirculars = await Circular.count({ where: { ...where, status: 'archived' } });
    const expiredCirculars = await Circular.count({ where: { ...where, status: 'expired' } });
    const stickyCirculars = await Circular.count({ where: { ...where, isSticky: true } });
    const importantCirculars = await Circular.count({ where: { ...where, isImportant: true } });
    const acknowledgmentRequired = await Circular.count({ where: { ...where, requiresAcknowledgment: true } });

    // Get type-wise statistics
    const typeStats = await Circular.findAll({
      where,
      attributes: [
        'circularType',
        [Circular.sequelize.fn('COUNT', Circular.sequelize.col('id')), 'count']
      ],
      group: ['circularType'],
      order: [[Circular.sequelize.fn('COUNT', Circular.sequelize.col('id')), 'DESC']]
    });

    // Get priority-wise statistics
    const priorityStats = await Circular.findAll({
      where,
      attributes: [
        'priority',
        [Circular.sequelize.fn('COUNT', Circular.sequelize.col('id')), 'count']
      ],
      group: ['priority'],
      order: [[Circular.sequelize.fn('COUNT', Circular.sequelize.col('id')), 'DESC']]
    });

    // Get recent circulars
    const recentCirculars = await Circular.findAll({
      where,
      include: [
        { model: User, as: 'creator', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get most viewed circulars
    const mostViewedCirculars = await Circular.findAll({
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
        totalCirculars,
        publishedCirculars,
        draftCirculars,
        archivedCirculars,
        expiredCirculars,
        stickyCirculars,
        importantCirculars,
        acknowledgmentRequired,
        typeStats,
        priorityStats,
        recentCirculars,
        mostViewedCirculars
      }
    });
  } catch (error) {
    console.error('Error fetching circular stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch circular statistics' });
  }
};

// Get public circulars (for students/parents)
const getPublicCirculars = async (req, res) => {
  try {
    const { limit = 20, circularType, priority } = req.query;

    const where = {
      status: 'published',
      [Op.or]: [
        { expiryDate: null },
        { expiryDate: { [Op.gte]: new Date() } }
      ]
    };

    if (circularType) where.circularType = circularType;
    if (priority) where.priority = priority;

    const circulars = await Circular.findAll({
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
      data: { circulars }
    });
  } catch (error) {
    console.error('Error fetching public circulars:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch public circulars' });
  }
};

module.exports = {
  getCirculars,
  getCircularById,
  createCircular,
  updateCircular,
  deleteCircular,
  publishCircular,
  acknowledgeCircular,
  getCircularStats,
  getPublicCirculars
};

