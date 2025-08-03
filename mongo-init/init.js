// MongoDB initialization script for FreelanceTimeTracker
db = db.getSiblingDB('freelance-timetracker');

// Create collections
db.createCollection('users');
db.createCollection('projects');
db.createCollection('timeentries');

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "createdAt": 1 });

db.projects.createIndex({ "userId": 1 });
db.projects.createIndex({ "name": 1 });
db.projects.createIndex({ "createdAt": 1 });

db.timeentries.createIndex({ "userId": 1 });
db.timeentries.createIndex({ "projectId": 1 });
db.timeentries.createIndex({ "startTime": 1 });
db.timeentries.createIndex({ "endTime": 1 });

print('FreelanceTimeTracker database initialized successfully!');
print('Collections created: users, projects, timeentries');
print('Indexes created for optimal performance');