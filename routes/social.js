const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const auth = require('../middleware/auth');
const { validateForum, validateForumPost, validateAnnouncement, validateEvent } = require('../middleware/validation');

// Forum Management Routes
router.get('/forums', auth.protect, socialController.getForums);
router.get('/forums/:id', auth.protect, socialController.getForumById);
router.post('/forums', auth.protect, validateForum, socialController.createForum);

// Forum Posts Routes
router.get('/forums/:forumId/posts', auth.protect, socialController.getForumPosts);
router.get('/posts/:id', auth.protect, socialController.getPostById);
router.post('/posts', auth.protect, validateForumPost, socialController.createPost);
router.post('/posts/:postId/like', auth.protect, socialController.togglePostLike);

// Announcements Routes
router.get('/announcements', auth.protect, socialController.getAnnouncements);
router.post('/announcements', auth.protect, validateAnnouncement, socialController.createAnnouncement);
router.post('/announcements/:id/view', auth.protect, socialController.markAnnouncementViewed);

// Events Routes
router.get('/events', auth.protect, socialController.getEvents);
router.post('/events', auth.protect, validateEvent, socialController.createEvent);
router.post('/events/:eventId/register', auth.protect, socialController.registerForEvent);
router.get('/events/:eventId/attendees', auth.protect, socialController.getEventAttendees);

module.exports = router;
