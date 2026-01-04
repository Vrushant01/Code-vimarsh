const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    // ✅ Accept BOTH old style (name) and new style (username)
    const { name, username, email, password } = req.body;

    const finalUsername = username || name; // 🔑 KEY FIX

    // Validation
    if (!finalUsername || !email || !password) {
      return res.status(400).json({
        message: 'All fields are required',
      });
    }

    // Validate username length
    if (finalUsername.length < 2) {
      return res.status(400).json({
        message: 'Username must be at least 2 characters long',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username: finalUsername }],
    });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user
    const user = await User.create({
      username: finalUsername,
      email,
      password,
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      message: 'Server error during registration',
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    return res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


// @desc    Create user as admin (admin only)
// @route   POST /api/auth/admin/create-user
// @access  Private (admin)
const createUserAsAdmin = async (req, res) => {
  try {
    const { username, email, password, role = 'user' } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: 'Username, email, and password are required',
      });
    }

    // Validate username length
    if (username.length < 2) {
      return res.status(400).json({
        message: 'Username must be at least 2 characters long',
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validate role
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role,
    });

    return res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Create user as admin error:', error);
    return res.status(500).json({
      message: 'Server error during user creation',
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  createUserAsAdmin,
};

