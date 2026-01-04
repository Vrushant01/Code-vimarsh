const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const forumRoutes = require('./routes/forumRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

// Middleware
// CORS configuration - Vercel ready
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Build allowed origins list
    const allowedOrigins = [];
    
    // Add localhost for development
    if (process.env.NODE_ENV !== 'production') {
      allowedOrigins.push(
        'http://localhost:5173',
        'http://localhost:8080',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:8080',
        'http://127.0.0.1:3000'
      );
    }
    
    // Add production frontend URL from environment variable
    if (process.env.FRONTEND_URL) {
      const frontendUrls = Array.isArray(process.env.FRONTEND_URL) 
        ? process.env.FRONTEND_URL 
        : process.env.FRONTEND_URL.split(',').map(url => url.trim());
      allowedOrigins.push(...frontendUrls);
    }
    
    // Check if origin is allowed
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Code Vimarsh Backend is running 🚀");
});


// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/team', teamRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Code Vimarsh API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Import User model for admin creation
const User = require('./models/User');

// Function to ensure default admin exists
const ensureDefaultAdmin = async () => {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@codevimarsh.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });

    if (!existingAdmin) {
      // Create default admin user
      await User.create({
        username: ADMIN_USERNAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log('✅ Default admin account created');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
    } else {
      // Ensure existing admin has admin role
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('✅ Existing user updated to admin role');
      }
    }
  } catch (error) {
    console.error('Error ensuring default admin:', error);
  }
};

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Ensure default admin exists
    await ensureDefaultAdmin();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
