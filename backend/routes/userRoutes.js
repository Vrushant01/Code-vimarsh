const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  deleteAccount,
  getAllUsers,
  updateUserRole
} = require('../controllers/userController');
const { protect, admin } = require('../middleware/authMiddleware');
const { avatarUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/:id', getUserProfile);

// Protected routes
router.put('/profile', protect, avatarUpload, updateProfile);
router.delete('/profile', protect, deleteAccount);

// Admin routes
router.get('/', protect, admin, getAllUsers);
router.put('/:id/role', protect, admin, updateUserRole);

module.exports = router;
