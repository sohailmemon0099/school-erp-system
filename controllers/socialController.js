const { Forum, ForumPost, PostLike, Announcement, AnnouncementView, Event, EventAttendance, User, Student, Teacher } = require('../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

// Forum Management

// Get all forums
const getForums = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isPublic } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (category) where.category = category;
    if (isPublic !== undefined) where.isPublic = isPublic === 'true';

    const forums = await Forum.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        forums: forums.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(forums.count / limit),
          totalItems: forums.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching forums:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch forums' });
  }
};

// Get forum by ID
const getForumById = async (req, res) => {
  try {
    const { id } = req.params;

    const forum = await Forum.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    if (!forum) {
      return res.status(404).json({ status: 'error', message: 'Forum not found' });
    }

    res.json({
      status: 'success',
      data: { forum }
    });
  } catch (error) {
    console.error('Error fetching forum:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch forum' });
  }
};

// Create forum
const createForum = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const forumData = { ...req.body, createdBy: req.user.id };
    const forum = await Forum.create(forumData);

    const createdForum = await Forum.findByPk(forum.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Forum created successfully',
      data: { forum: createdForum }
    });
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create forum' });
  }
};

// Forum Posts Management

// Get posts for a forum
const getForumPosts = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { page = 1, limit = 10, pinned } = req.query;
    const offset = (page - 1) * limit;

    const where = { forumId, isActive: true, parentPostId: null };
    if (pinned === 'true') where.isPinned = true;

    const posts = await ForumPost.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: Forum,
          as: 'forum',
          attributes: ['id', 'title', 'category']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['isPinned', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        posts: posts.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(posts.count / limit),
          totalItems: posts.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching forum posts:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch forum posts' });
  }
};

// Get post by ID with replies
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await ForumPost.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: Forum,
          as: 'forum',
          attributes: ['id', 'title', 'category']
        },
        {
          model: ForumPost,
          as: 'replies',
          include: [
            {
              model: User,
              as: 'creator',
              attributes: ['id', 'firstName', 'lastName', 'profileImage']
            }
          ],
          order: [['createdAt', 'ASC']]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ status: 'error', message: 'Post not found' });
    }

    // Increment view count
    await post.increment('viewCount');

    res.json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch post' });
  }
};

// Create post
const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const postData = { ...req.body, createdBy: req.user.id };
    const post = await ForumPost.create(postData);

    // Update reply count if it's a reply
    if (post.parentPostId) {
      await ForumPost.increment('replyCount', {
        where: { id: post.parentPostId }
      });
    }

    const createdPost = await ForumPost.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        },
        {
          model: Forum,
          as: 'forum',
          attributes: ['id', 'title', 'category']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: { post: createdPost }
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create post' });
  }
};

// Like/Unlike post
const togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const { likeType = 'like' } = req.body;
    const userId = req.user.id;

    // Check if user already liked/disliked this post
    const existingLike = await PostLike.findOne({
      where: { postId, userId }
    });

    if (existingLike) {
      if (existingLike.likeType === likeType) {
        // Remove like/dislike
        await existingLike.destroy();
        await ForumPost.decrement('likeCount', { where: { id: postId } });
        return res.json({
          status: 'success',
          message: 'Like removed',
          data: { liked: false }
        });
      } else {
        // Change like type
        await existingLike.update({ likeType });
        return res.json({
          status: 'success',
          message: 'Like updated',
          data: { liked: true, likeType }
        });
      }
    } else {
      // Create new like
      await PostLike.create({ postId, userId, likeType });
      await ForumPost.increment('likeCount', { where: { id: postId } });
      return res.json({
        status: 'success',
        message: 'Post liked',
        data: { liked: true, likeType }
      });
    }
  } catch (error) {
    console.error('Error toggling post like:', error);
    res.status(500).json({ status: 'error', message: 'Failed to toggle post like' });
  }
};

// Announcements Management

// Get announcements
const getAnnouncements = async (req, res) => {
  try {
    const { page = 1, limit = 10, priority, targetAudience } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (priority) where.priority = priority;
    if (targetAudience) where.targetAudience = targetAudience;

    // Add expiration filter
    where[Op.or] = [
      { expiresAt: null },
      { expiresAt: { [Op.gt]: new Date() } }
    ];

    const announcements = await Announcement.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['priority', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        announcements: announcements.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(announcements.count / limit),
          totalItems: announcements.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch announcements' });
  }
};

// Create announcement
const createAnnouncement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const announcementData = { ...req.body, createdBy: req.user.id };
    const announcement = await Announcement.create(announcementData);

    const createdAnnouncement = await Announcement.findByPk(announcement.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Announcement created successfully',
      data: { announcement: createdAnnouncement }
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create announcement' });
  }
};

// Mark announcement as viewed
const markAnnouncementViewed = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if already viewed
    const existingView = await AnnouncementView.findOne({
      where: { announcementId: id, userId }
    });

    if (!existingView) {
      await AnnouncementView.create({
        announcementId: id,
        userId,
        viewedAt: new Date()
      });
    }

    res.json({
      status: 'success',
      message: 'Announcement marked as viewed'
    });
  } catch (error) {
    console.error('Error marking announcement as viewed:', error);
    res.status(500).json({ status: 'error', message: 'Failed to mark announcement as viewed' });
  }
};

// Events Management

// Get events
const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 10, eventType, upcoming } = req.query;
    const offset = (page - 1) * limit;

    const where = { isActive: true };
    if (eventType) where.eventType = eventType;
    
    if (upcoming === 'true') {
      where.startDate = { [Op.gte]: new Date() };
    }

    const events = await Event.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['startDate', 'ASC']]
    });

    res.json({
      status: 'success',
      data: {
        events: events.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(events.count / limit),
          totalItems: events.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch events' });
  }
};

// Create event
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const eventData = { ...req.body, createdBy: req.user.id };
    const event = await Event.create(eventData);

    const createdEvent = await Event.findByPk(event.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      status: 'success',
      message: 'Event created successfully',
      data: { event: createdEvent }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create event' });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status = 'attending' } = req.body;
    const userId = req.user.id;

    // Check if already registered
    const existingRegistration = await EventAttendance.findOne({
      where: { eventId, userId }
    });

    if (existingRegistration) {
      await existingRegistration.update({ status });
    } else {
      await EventAttendance.create({
        eventId,
        userId,
        status,
        registeredAt: new Date()
      });
    }

    res.json({
      status: 'success',
      message: 'Event registration updated successfully'
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ status: 'error', message: 'Failed to register for event' });
  }
};

// Get event attendees
const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;

    const attendees = await EventAttendance.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ],
      order: [['registeredAt', 'ASC']]
    });

    res.json({
      status: 'success',
      data: { attendees }
    });
  } catch (error) {
    console.error('Error fetching event attendees:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch event attendees' });
  }
};

module.exports = {
  // Forum Management
  getForums,
  getForumById,
  createForum,
  
  // Forum Posts Management
  getForumPosts,
  getPostById,
  createPost,
  togglePostLike,
  
  // Announcements Management
  getAnnouncements,
  createAnnouncement,
  markAnnouncementViewed,
  
  // Events Management
  getEvents,
  createEvent,
  registerForEvent,
  getEventAttendees
};
