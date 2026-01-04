const express = require('express');
const router = express.Router();
const {
  getTeamMembers,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
} = require('../controllers/teamController');
const { protect, admin } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getTeamMembers);

// Admin routes
router.get('/all', protect, admin, getAllTeamMembers);
router.post('/', protect, admin, upload.single('photo'), createTeamMember);
router.put('/:id', protect, admin, upload.single('photo'), updateTeamMember);
router.delete('/:id', protect, admin, deleteTeamMember);

module.exports = router;

