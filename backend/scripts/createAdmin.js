/**
 * Script to create or update an admin user
 * Usage: node scripts/createAdmin.js [email] [password] [username]
 * If no arguments provided, creates default admin: admin@codevimarsh.com / admin123
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get arguments from command line or use defaults
    const args = process.argv.slice(2);
    const email = args[0] || process.env.ADMIN_EMAIL || 'admin@codevimarsh.com';
    const password = args[1] || process.env.ADMIN_PASSWORD || 'admin123';
    const username = args[2] || process.env.ADMIN_USERNAME || 'admin';

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      if (existingUser.email === email) {
        console.log(`User with email ${email} already exists. Updating to admin...`);
        existingUser.role = 'admin';
        // Update password if provided
        if (args[1]) {
          existingUser.password = password;
        }
        await existingUser.save();
        console.log(`✅ User ${email} is now an admin!`);
      } else {
        console.log(`User with username ${username} already exists. Updating to admin...`);
        existingUser.role = 'admin';
        existingUser.email = email;
        if (args[1]) {
          existingUser.password = password;
        }
        await existingUser.save();
        console.log(`✅ User ${username} is now an admin!`);
      }
    } else {
      // Create new admin user
      const admin = await User.create({
        username,
        email,
        password,
        role: 'admin',
      });

      console.log('✅ Admin user created successfully!');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}`);
    }

    console.log('\n📝 Default Admin Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Username: ${username}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdmin();

