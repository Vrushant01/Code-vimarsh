const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
  getUserProjects
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');
const { projectUpload } = require('../middleware/uploadMiddleware');

// Public routes
router.get('/', getProjects);
router.get('/:id', getProject);
router.get('/user/:userId', getUserProjects);

// Protected routes
router.post('/', protect, projectUpload, createProject);
router.put('/:id', protect, projectUpload, updateProject);
router.delete('/:id', protect, deleteProject);
router.post('/:id/like', protect, toggleLike);

module.exports = router;
