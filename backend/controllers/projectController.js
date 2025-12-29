const Project = require('../models/Project');
const fs = require('fs');
const path = require('path');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
const getProjects = async (req, res) => {
  try {
    const { search, technology, sort = '-createdAt', page = 1, limit = 12 } = req.query;
    
    let query = {};

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Technology filter
    if (technology) {
      query.technologies = { $in: technology.split(',') };
    }

    const projects = await Project.find(query)
      .populate('author', 'username avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Public
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('author', 'username avatar bio');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Increment views
    project.views += 1;
    await project.save();

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description, technologies, githubLink, liveLink } = req.body;

    const projectData = {
      title,
      description,
      technologies: technologies ? JSON.parse(technologies) : [],
      githubLink,
      liveLink,
      author: req.user._id
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        projectData.image = '/uploads/images/' + req.files.image[0].filename;
      }
      if (req.files.video) {
        projectData.video = '/uploads/videos/' + req.files.video[0].filename;
      }
      if (req.files.document) {
        projectData.document = '/uploads/documents/' + req.files.document[0].filename;
      }
    }

    const project = await Project.create(projectData);
    const populatedProject = await Project.findById(project._id)
      .populate('author', 'username avatar');

    res.status(201).json(populatedProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (owner only)
const updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership
    if (project.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const { title, description, technologies, githubLink, liveLink } = req.body;

    const updateData = {
      title: title || project.title,
      description: description || project.description,
      technologies: technologies ? JSON.parse(technologies) : project.technologies,
      githubLink: githubLink || project.githubLink,
      liveLink: liveLink !== undefined ? liveLink : project.liveLink
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        // Delete old image if exists
        if (project.image) {
          const oldPath = path.join(__dirname, '..', project.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.image = '/uploads/images/' + req.files.image[0].filename;
      }
      if (req.files.video) {
        if (project.video) {
          const oldPath = path.join(__dirname, '..', project.video);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.video = '/uploads/videos/' + req.files.video[0].filename;
      }
      if (req.files.document) {
        if (project.document) {
          const oldPath = path.join(__dirname, '..', project.document);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.document = '/uploads/documents/' + req.files.document[0].filename;
      }
    }

    project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'username avatar');

    res.json(project);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (owner only)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check ownership
    if (project.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    // Delete associated files
    const filesToDelete = [project.image, project.video, project.document];
    filesToDelete.forEach(file => {
      if (file) {
        const filePath = path.join(__dirname, '..', file);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    });

    await Project.findByIdAndDelete(req.params.id);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Like/Unlike project
// @route   POST /api/projects/:id/like
// @access  Private
const toggleLike = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const userIndex = project.likes.indexOf(req.user._id);

    if (userIndex === -1) {
      project.likes.push(req.user._id);
    } else {
      project.likes.splice(userIndex, 1);
    }

    await project.save();

    res.json({ likes: project.likes.length, isLiked: userIndex === -1 });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user's projects
// @route   GET /api/projects/user/:userId
// @access  Public
const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ author: req.params.userId })
      .populate('author', 'username avatar')
      .sort('-createdAt');

    res.json(projects);
  } catch (error) {
    console.error('Get user projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  toggleLike,
  getUserProjects
};
