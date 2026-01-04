const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent
} = require('../controllers/eventController');
const { protect, moderator, admin } = require('../middleware/authMiddleware');
const { eventImageUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/:id/register', protect, registerForEvent);
router.delete('/:id/register', protect, unregisterFromEvent);

// Admin/Moderator routes
router.post('/', protect, moderator, eventImageUpload, createEvent);
router.put('/:id', protect, moderator, eventImageUpload, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;
