const mongoose = require('mongoose');
require('dotenv').config();

// Since you can see data in Navicat, let's try connecting directly
const connectAndSeed = async () => {
  try {
    // Connect to MongoDB (using exact same method as backend server)
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Import models
    const Project = require('./src/models/Project');
    const User = require('./src/models/User');

    // Check for existing users
    let existingUser = await User.findOne();
    
    if (!existingUser) {
      console.log('👤 No users found. Creating test user...');
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      existingUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('✅ Created test user: test@example.com (password: password123)');
    } else {
      console.log(`👤 Found existing user: ${existingUser.email}`);
    }

    // Create a single test project
    const testProject = {
      title: 'Sample E-commerce Project',
      client: 'Demo Client Corp',
      description: 'Building a modern e-commerce platform with real-time features',
      hourlyRate: 85,
      status: 'active',
      estimatedHours: 100,
      totalHoursWorked: 35.5,
      totalEarnings: 3017.50,
      userId: existingUser._id,
      tags: ['Angular', 'Node.js', 'MongoDB'],
      startDate: new Date('2024-07-01'),
      notes: 'High priority client project with modern tech stack'
    };

    // Remove any existing test projects
    await Project.deleteMany({ title: 'Sample E-commerce Project' });

    // Create the test project
    const newProject = await Project.create(testProject);
    console.log('✅ Created test project:', newProject.title);

    console.log('\n🎉 Test project created successfully!');
    console.log('📊 Project Details:');
    console.log(`   Title: ${newProject.title}`);
    console.log(`   Client: ${newProject.client}`);
    console.log(`   Rate: $${newProject.hourlyRate}/hr`);
    console.log(`   Hours: ${newProject.totalHoursWorked}/${newProject.estimatedHours}`);
    console.log(`   Earnings: $${newProject.totalEarnings}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

connectAndSeed();