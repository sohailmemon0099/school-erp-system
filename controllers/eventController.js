const { SchoolEvent, User, Class, Student } = require('../models');
const { Op } = require('sequelize');

// Generate unique event ID
const generateEventId = (eventType) => {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${eventType.toUpperCase()}_${timestamp}_${random}`;
};

// Get all events
const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, eventType, status, targetAudience, academicYear, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { eventId: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (eventType) where.eventType = eventType;
    if (status) where.status = status;
    if (targetAudience) where.targetAudience = targetAudience;
    if (academicYear) where.academicYear = academicYear;
    
    if (startDate && endDate) {
      where.startDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows: events } = await SchoolEvent.findAndCountAll({
      where,
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'organizer', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      status: 'success',
      data: {
        events,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
  }
};

// Get event by ID
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await SchoolEvent.findByPk(id, {
      include: [
        { model: Class, as: 'class', attributes: ['id', 'name', 'section'] },
        { model: Student, as: 'student', include: [
          { model: User, as: 'user', attributes: ['firstName', 'lastName'] }
        ]},
        { model: User, as: 'organizer', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'firstName', 'lastName', 'email'] }
      ]
    });

    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    res.json({ status: 'success', data: { event } });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch event' });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      venue,
      targetAudience,
      classId,
      studentId,
      academicYear,
      isRecurring,
      recurrencePattern,
      recurrenceInterval,
      maxParticipants,
      registrationRequired,
      registrationDeadline,
      attachments,
      tags,
      organizerId
    } = req.body;

    const eventId = generateEventId(eventType);

    const event = await SchoolEvent.create({
      eventId,
      title,
      description,
      eventType,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      startTime,
      endTime,
      location,
      venue,
      targetAudience,
      classId,
      studentId,
      academicYear,
      isRecurring: isRecurring || false,
      recurrencePattern,
      recurrenceInterval: recurrenceInterval || 1,
      maxParticipants,
      registrationRequired: registrationRequired || false,
      registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
      attachments,
      tags,
      organizerId,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create event' });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const event = await SchoolEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    // Convert date strings to Date objects
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.registrationDeadline) {
      updateData.registrationDeadline = new Date(updateData.registrationDeadline);
    }

    await event.update(updateData);

    res.json({
      status: 'success',
      message: 'Event updated successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update event' });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await SchoolEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    await event.destroy();

    res.json({ status: 'success', message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ status: 'error', message: 'Failed to delete event' });
  }
};

// Update event status
const updateEventStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const event = await SchoolEvent.findByPk(id);
    if (!event) {
      return res.status(404).json({ status: 'error', message: 'Event not found' });
    }

    await event.update({ status });

    res.json({
      status: 'success',
      message: 'Event status updated successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Error updating event status:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update event status' });
  }
};

// Get event statistics
const getEventStats = async (req, res) => {
  try {
    const { academicYear } = req.query;
    
    const where = {};
    if (academicYear) where.academicYear = academicYear;

    const totalEvents = await SchoolEvent.count({ where });
    const scheduledEvents = await SchoolEvent.count({ where: { ...where, status: 'scheduled' } });
    const ongoingEvents = await SchoolEvent.count({ where: { ...where, status: 'ongoing' } });
    const completedEvents = await SchoolEvent.count({ where: { ...where, status: 'completed' } });
    const cancelledEvents = await SchoolEvent.count({ where: { ...where, status: 'cancelled' } });
    const postponedEvents = await SchoolEvent.count({ where: { ...where, status: 'postponed' } });

    // Get type-wise statistics
    const typeStats = await SchoolEvent.findAll({
      where,
      attributes: [
        'eventType',
        [SchoolEvent.sequelize.fn('COUNT', SchoolEvent.sequelize.col('id')), 'count']
      ],
      group: ['eventType'],
      order: [[SchoolEvent.sequelize.fn('COUNT', SchoolEvent.sequelize.col('id')), 'DESC']]
    });

    // Get upcoming events
    const upcomingEvents = await SchoolEvent.findAll({
      where: {
        ...where,
        startDate: {
          [Op.gte]: new Date()
        },
        status: 'scheduled'
      },
      include: [
        { model: User, as: 'organizer', attributes: ['firstName', 'lastName'] }
      ],
      order: [['startDate', 'ASC']],
      limit: 10
    });

    // Get recent events
    const recentEvents = await SchoolEvent.findAll({
      where,
      include: [
        { model: User, as: 'organizer', attributes: ['firstName', 'lastName'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      status: 'success',
      data: {
        totalEvents,
        scheduledEvents,
        ongoingEvents,
        completedEvents,
        cancelledEvents,
        postponedEvents,
        typeStats,
        upcomingEvents,
        recentEvents
      }
    });
  } catch (error) {
    console.error('Error fetching event stats:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch event statistics' });
  }
};

// Get upcoming events
const getUpcomingEvents = async (req, res) => {
  try {
    const { limit = 10, days = 30 } = req.query;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const events = await SchoolEvent.findAll({
      where: {
        startDate: {
          [Op.between]: [new Date(), futureDate]
        },
        status: 'scheduled'
      },
      include: [
        { model: User, as: 'organizer', attributes: ['firstName', 'lastName'] }
      ],
      order: [['startDate', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: { events }
    });
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch upcoming events' });
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getEventStats,
  getUpcomingEvents
};
