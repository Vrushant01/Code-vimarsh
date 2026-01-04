const Team = require('../models/Team');
const fs = require('fs');
const path = require('path');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res) => {
  try {
    const members = await Team.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 });

    res.json(members);
  } catch (error) {
    console.error('Get team members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all team members (admin - includes inactive)
// @route   GET /api/team/all
// @access  Private (admin)
const getAllTeamMembers = async (req, res) => {
  try {
    const members = await Team.find()
      .sort({ order: 1, createdAt: -1 });

    res.json(members);
  } catch (error) {
    console.error('Get all team members error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create team member
// @route   POST /api/team
// @access  Private (admin)
const createTeamMember = async (req, res) => {
  try {
    const { name, role, bio, socialLinks, order } = req.body;

    if (!name || !role) {
      return res.status(400).json({ message: 'Name and role are required' });
    }

    const teamData = {
      name: name.trim(),
      role: role.trim(),
      bio: bio ? bio.trim() : '',
      order: order ? parseInt(order) : 0,
      socialLinks: socialLinks ? JSON.parse(socialLinks) : {}
    };

    if (req.file) {
      teamData.photo = '/uploads/images/' + req.file.filename;
    }

    const member = await Team.create(teamData);

    res.status(201).json(member);
  } catch (error) {
    console.error('Create team member error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private (admin)
const updateTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    const { name, role, bio, socialLinks, order, isActive } = req.body;

    if (name) member.name = name.trim();
    if (role) member.role = role.trim();
    if (bio !== undefined) member.bio = bio.trim();
    if (socialLinks) member.socialLinks = JSON.parse(socialLinks);
    if (order !== undefined) member.order = parseInt(order);
    if (isActive !== undefined) member.isActive = isActive;

    // Handle photo upload
    if (req.file) {
      // Delete old photo if exists
      if (member.photo && member.photo.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', member.photo);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      member.photo = '/uploads/images/' + req.file.filename;
    }

    await member.save();

    res.json(member);
  } catch (error) {
    console.error('Update team member error:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private (admin)
const deleteTeamMember = async (req, res) => {
  try {
    const member = await Team.findById(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    // Delete photo if exists
    if (member.photo && member.photo.startsWith('/uploads/')) {
      const photoPath = path.join(__dirname, '..', member.photo);
      if (fs.existsSync(photoPath)) fs.unlinkSync(photoPath);
    }

    await Team.findByIdAndDelete(req.params.id);

    res.json({ message: 'Team member deleted successfully' });
  } catch (error) {
    console.error('Delete team member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getTeamMembers,
  getAllTeamMembers,
  createTeamMember,
  updateTeamMember,
  deleteTeamMember
};

