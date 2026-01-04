const express = require('express');
const router = express.Router();
const {
  getTopics,
  getTopic,
  createTopic,
  updateTopic,
  deleteTopic,
  addReply,
  deleteReply,
  togglePin,
  toggleLock
} = require('../controllers/forumController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getTopics);
router.get('/:id', getTopic);

// Protected routes
router.post('/', protect, createTopic);
router.put('/:id', protect, updateTopic);
router.delete('/:id', protect, deleteTopic);
router.post('/:id/replies', protect, addReply);
router.delete('/:id/replies/:replyId', protect, deleteReply);

// Admin routes
router.put('/:id/pin', protect, admin, togglePin);
router.put('/:id/lock', protect, admin, toggleLock);

module.exports = router;
