const express = require('express');
const authRoutes = require('./auth');
const projectRoutes = require('./projects');
const timeEntryRoutes = require('./timeEntries');

const router = express.Router();

// API routes
router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/time-entries', timeEntryRoutes);

// TEMPORARY: Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    message: 'Freelance Time Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/profile': 'Get user profile (requires auth)',
        'PUT /api/auth/profile': 'Update user profile (requires auth)',
        'PUT /api/auth/change-password': 'Change password (requires auth)'
      },
      projects: {
        'GET /api/projects': 'Get all projects (requires auth)',
        'GET /api/projects/stats': 'Get project statistics (requires auth)',
        'GET /api/projects/:id': 'Get specific project (requires auth)',
        'POST /api/projects': 'Create new project (requires auth)',
        'PUT /api/projects/:id': 'Update project (requires auth)',
        'DELETE /api/projects/:id': 'Delete project (requires auth)',
        'PUT /api/projects/:id/complete': 'Mark project as complete (requires auth)'
      },
      timeEntries: {
        'GET /api/time-entries': 'Get all time entries (requires auth)',
        'GET /api/time-entries/stats': 'Get time statistics (requires auth)',
        'GET /api/time-entries/daily-summary': 'Get daily summary (requires auth)',
        'GET /api/time-entries/project/:projectId': 'Get time entries for project (requires auth)',
        'POST /api/time-entries': 'Create new time entry (requires auth)',
        'PUT /api/time-entries/:id': 'Update time entry (requires auth)',
        'DELETE /api/time-entries/:id': 'Delete time entry (requires auth)'
      }
    }
  });
});

module.exports = router;
