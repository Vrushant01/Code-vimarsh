const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, createUserAsAdmin } = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/password', protect, updatePassword);

// Admin routes
router.post('/admin/create-user', protect, admin, createUserAsAdmin);

module.exports = router;
