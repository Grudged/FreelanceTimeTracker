const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/.env' });

// Import models
const User = require('./src/models/User');
const Project = require('./src/models/Project');
const TimeEntry = require('./src/models/TimeEntry');

const seedTestData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create a test user if none exists
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      console.log('👤 Creating test user...');
      testUser = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      });
      console.log('✅ Test user created');
    } else {
      console.log('👤 Test user already exists');
    }

    // Clear existing test projects
    await Project.deleteMany({ title: { $regex: /^Test Project/ } });
    await TimeEntry.deleteMany({});

    // Create test projects
    console.log('📁 Creating test projects...');
    
    const testProjects = [
      {
        title: 'Test Project - E-commerce Website',
        client: 'Acme Corp',
        description: 'Building a modern e-commerce platform with Angular and Node.js',
        hourlyRate: 75,
        status: 'active',
        estimatedHours: 120,
        totalHoursWorked: 45.5,
        totalEarnings: 3412.50,
        userId: testUser._id,
        tags: ['Angular', 'Node.js', 'E-commerce'],
        startDate: new Date('2024-01-15'),
        notes: 'Client wants modern UI with mobile-first design'
      },
      {
        title: 'Test Project - API Development',
        client: 'TechStart Inc',
        description: 'RESTful API development for mobile app backend',
        hourlyRate: 85,
        status: 'active',
        estimatedHours: 80,
        totalHoursWorked: 32.0,
        totalEarnings: 2720.00,
        userId: testUser._id,
        tags: ['Node.js', 'MongoDB', 'API'],
        startDate: new Date('2024-02-01'),
        notes: 'Focus on scalability and security'
      },
      {
        title: 'Test Project - Dashboard Analytics',
        client: 'DataViz Solutions',
        description: 'Real-time analytics dashboard with data visualization',
        hourlyRate: 90,
        status: 'completed',
        estimatedHours: 60,
        totalHoursWorked: 58.0,
        totalEarnings: 5220.00,
        userId: testUser._id,
        tags: ['React', 'D3.js', 'Analytics'],
        startDate: new Date('2023-12-01'),
        endDate: new Date('2024-01-10'),
        notes: 'Completed ahead of schedule'
      },
      {
        title: 'Test Project - Mobile App UI',
        client: 'StartupXYZ',
        description: 'Flutter mobile app user interface design and implementation',
        hourlyRate: 70,
        status: 'paused',
        estimatedHours: 40,
        totalHoursWorked: 15.0,
        totalEarnings: 1050.00,
        userId: testUser._id,
        tags: ['Flutter', 'Mobile', 'UI/UX'],
        startDate: new Date('2024-02-15'),
        notes: 'On hold pending client feedback'
      }
    ];

    const createdProjects = await Project.insertMany(testProjects);
    console.log(`✅ Created ${createdProjects.length} test projects`);

    // Create some time entries for the active projects
    console.log('⏰ Creating test time entries...');
    
    const timeEntries = [
      // E-commerce project entries
      {
        projectId: createdProjects[0]._id,
        userId: testUser._id,
        date: new Date('2024-08-01'),
        startTime: '09:00',
        endTime: '17:00',
        hoursWorked: 8.0,
        description: 'Set up project structure and initial components',
        taskType: 'development'
      },
      {
        projectId: createdProjects[0]._id,
        userId: testUser._id,
        date: new Date('2024-08-02'),
        startTime: '09:00',
        endTime: '13:30',
        hoursWorked: 4.5,
        description: 'Implemented user authentication system',
        taskType: 'development'
      },
      // API project entries
      {
        projectId: createdProjects[1]._id,
        userId: testUser._id,
        date: new Date('2024-08-03'),
        startTime: '10:00',
        endTime: '16:00',
        hoursWorked: 6.0,
        description: 'Created RESTful endpoints for user management',
        taskType: 'development'
      },
      {
        projectId: createdProjects[1]._id,
        userId: testUser._id,
        date: new Date('2024-08-04'),
        startTime: '14:00',
        endTime: '18:00',
        hoursWorked: 4.0,
        description: 'Database schema design and implementation',
        taskType: 'development'
      }
    ];

    const createdTimeEntries = await TimeEntry.insertMany(timeEntries);
    console.log(`✅ Created ${createdTimeEntries.length} test time entries`);

    console.log('\n🎉 Test data seeded successfully!');
    console.log('\n📊 Test Data Summary:');
    console.log(`👤 User: ${testUser.email} (password: password123)`);
    console.log(`📁 Projects: ${createdProjects.length}`);
    console.log(`⏰ Time Entries: ${createdTimeEntries.length}`);
    console.log('\n🔧 You can now login with:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the seed script
seedTestData();