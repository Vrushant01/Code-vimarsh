/**
 * Seed script to populate database with demo data
 * Usage: node scripts/seedDemoData.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Event = require('../models/Event');
const Project = require('../models/Project');

const seedDemoData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing demo data (optional - comment out if you want to keep existing data)
    console.log('🧹 Cleaning up existing demo data...');
    await User.deleteMany({ email: { $regex: /^demo\d+@/ } });
    await Event.deleteMany({ title: { $regex: /^Demo / } });
    await Project.deleteMany({ title: { $regex: /^Demo / } });
    console.log('✅ Cleanup complete');

    // Create 5 demo users
    console.log('\n👥 Creating demo users...');
    const users = [];
    const userData = [
      {
        username: 'alice_dev',
        email: 'demo1@codevimarsh.com',
        password: 'demo123',
        bio: 'Full-stack developer passionate about React and Node.js. Love building scalable web applications.',
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
        socialLinks: {
          github: 'https://github.com/alice_dev',
          linkedin: 'https://linkedin.com/in/alice_dev'
        },
        role: 'moderator'
      },
      {
        username: 'bob_coder',
        email: 'demo2@codevimarsh.com',
        password: 'demo123',
        bio: 'Python enthusiast and AI/ML developer. Working on machine learning projects.',
        skills: ['Python', 'TensorFlow', 'Django', 'PostgreSQL'],
        socialLinks: {
          github: 'https://github.com/bob_coder',
          linkedin: 'https://linkedin.com/in/bob_coder'
        },
        role: 'user'
      },
      {
        username: 'charlie_web',
        email: 'demo3@codevimarsh.com',
        password: 'demo123',
        bio: 'Frontend developer specializing in modern JavaScript frameworks and UI/UX design.',
        skills: ['Vue.js', 'CSS', 'Figma', 'JavaScript'],
        socialLinks: {
          github: 'https://github.com/charlie_web',
          linkedin: 'https://linkedin.com/in/charlie_web'
        },
        role: 'user'
      },
      {
        username: 'diana_mobile',
        email: 'demo4@codevimarsh.com',
        password: 'demo123',
        bio: 'Mobile app developer with expertise in React Native and Flutter. Building cross-platform apps.',
        skills: ['React Native', 'Flutter', 'Firebase', 'Swift'],
        socialLinks: {
          github: 'https://github.com/diana_mobile',
          linkedin: 'https://linkedin.com/in/diana_mobile'
        },
        role: 'user'
      },
      {
        username: 'eve_backend',
        email: 'demo5@codevimarsh.com',
        password: 'demo123',
        bio: 'Backend engineer focused on microservices architecture and cloud infrastructure.',
        skills: ['Go', 'Docker', 'Kubernetes', 'AWS'],
        socialLinks: {
          github: 'https://github.com/eve_backend',
          linkedin: 'https://linkedin.com/in/eve_backend'
        },
        role: 'moderator'
      }
    ];

    for (const userInfo of userData) {
      const existingUser = await User.findOne({ email: userInfo.email });
      if (existingUser) {
        console.log(`   ⚠️  User ${userInfo.email} already exists, skipping...`);
        users.push(existingUser);
      } else {
        const user = await User.create(userInfo);
        users.push(user);
        console.log(`   ✅ Created user: ${user.username} (${user.email})`);
      }
    }

    // Create 5 demo events
    console.log('\n📅 Creating demo events...');
    const now = new Date();
    const events = [];
    const eventData = [
      {
        title: 'Demo React Workshop 2024',
        description: 'Learn React fundamentals and build your first React application. This workshop covers components, hooks, state management, and modern React patterns. Perfect for beginners and intermediate developers.',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        location: 'Online',
        type: 'workshop',
        maxParticipants: 50,
        organizer: users[0]._id, // alice_dev
        isPublished: true
      },
      {
        title: 'Demo Code Sprint Hackathon',
        description: '24-hour hackathon to build innovative solutions. Work in teams to create projects that solve real-world problems. Prizes worth $5000! Categories include web apps, mobile apps, and AI/ML projects.',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        endDate: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // Next day
        location: 'Tech Hub, Building A',
        type: 'hackathon',
        maxParticipants: 100,
        organizer: users[4]._id, // eve_backend
        isPublished: true
      },
      {
        title: 'Demo AI/ML Study Group Meetup',
        description: 'Weekly meetup to discuss and practice machine learning concepts. This session focuses on neural networks and deep learning. Bring your questions and projects!',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        endDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        location: 'Online',
        type: 'meetup',
        maxParticipants: 30,
        organizer: users[1]._id, // bob_coder
        isPublished: true
      },
      {
        title: 'Demo Web Development Bootcamp',
        description: 'Intensive 5-day bootcamp covering HTML, CSS, JavaScript, React, and Node.js. Learn to build full-stack web applications from scratch. Includes hands-on projects and portfolio building.',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        endDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000), // 5 days later
        location: 'Online',
        type: 'workshop',
        maxParticipants: 40,
        organizer: users[0]._id, // alice_dev
        isPublished: true
      },
      {
        title: 'Demo Tech Talk: Cloud Architecture',
        description: 'Expert talk on modern cloud architecture patterns, microservices, and DevOps best practices. Learn from industry professionals about scaling applications and infrastructure.',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 90 minutes later
        location: 'Online',
        type: 'webinar',
        maxParticipants: 200,
        organizer: users[4]._id, // eve_backend
        isPublished: true
      }
    ];

    for (const eventInfo of eventData) {
      const existingEvent = await Event.findOne({ title: eventInfo.title });
      if (existingEvent) {
        console.log(`   ⚠️  Event "${eventInfo.title}" already exists, skipping...`);
        events.push(existingEvent);
      } else {
        const event = await Event.create(eventInfo);
        events.push(event);
        console.log(`   ✅ Created event: ${event.title}`);
      }
    }

    // Create 5 demo projects
    console.log('\n💻 Creating demo projects...');
    const projectData = [
      {
        title: 'Demo E-Commerce Platform',
        description: 'A full-stack e-commerce platform built with React and Node.js. Features include user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Includes responsive design and modern UI components.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe API'],
        githubLink: 'https://github.com/demo/ecommerce-platform',
        liveLink: 'https://demo-ecommerce.vercel.app',
        author: users[0]._id, // alice_dev
        likes: [users[1]._id, users[2]._id, users[3]._id],
        views: 245
      },
      {
        title: 'Demo Task Management App',
        description: 'A collaborative task management application with real-time updates. Built with Vue.js and Firebase. Features include drag-and-drop task organization, team collaboration, notifications, and project boards.',
        technologies: ['Vue.js', 'Firebase', 'Vuex', 'CSS3'],
        githubLink: 'https://github.com/demo/task-manager',
        liveLink: 'https://demo-taskmanager.netlify.app',
        author: users[2]._id, // charlie_web
        likes: [users[0]._id, users[4]._id],
        views: 189
      },
      {
        title: 'Demo Machine Learning Model Trainer',
        description: 'An interactive web application for training and visualizing machine learning models. Supports multiple algorithms, data visualization, model evaluation metrics, and export functionality. Built with Python Flask and TensorFlow.js.',
        technologies: ['Python', 'Flask', 'TensorFlow.js', 'D3.js', 'Pandas'],
        githubLink: 'https://github.com/demo/ml-trainer',
        liveLink: 'https://demo-mltrainer.herokuapp.com',
        author: users[1]._id, // bob_coder
        likes: [users[0]._id, users[2]._id, users[3]._id, users[4]._id],
        views: 312
      },
      {
        title: 'Demo Social Media Mobile App',
        description: 'A cross-platform social media mobile application built with React Native. Features include user profiles, posts, comments, likes, real-time messaging, push notifications, and photo sharing. Available on iOS and Android.',
        technologies: ['React Native', 'Firebase', 'Redux', 'Expo'],
        githubLink: 'https://github.com/demo/social-app',
        liveLink: 'https://apps.apple.com/demo-social',
        author: users[3]._id, // diana_mobile
        likes: [users[0]._id, users[1]._id],
        views: 156
      },
      {
        title: 'Demo API Gateway Service',
        description: 'A high-performance API gateway built with Go and microservices architecture. Features include request routing, rate limiting, authentication, logging, monitoring, and load balancing. Designed for scalability and reliability.',
        technologies: ['Go', 'Docker', 'Kubernetes', 'Redis', 'PostgreSQL'],
        githubLink: 'https://github.com/demo/api-gateway',
        liveLink: 'https://api.demo-gateway.com',
        author: users[4]._id, // eve_backend
        likes: [users[0]._id, users[1]._id, users[2]._id],
        views: 278
      }
    ];

    for (const projectInfo of projectData) {
      const existingProject = await Project.findOne({ title: projectInfo.title });
      if (existingProject) {
        console.log(`   ⚠️  Project "${projectInfo.title}" already exists, skipping...`);
      } else {
        const project = await Project.create(projectInfo);
        console.log(`   ✅ Created project: ${project.title}`);
      }
    }

    console.log('\n✅ Demo data seeding completed successfully!');
    console.log('\n📝 Demo User Credentials (all passwords: demo123):');
    userData.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.username} - ${user.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding demo data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDemoData();

