const express = require('express');
const ProjectController = require('../controllers/ProjectController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

// Project CRUD operations
router.get('/', ProjectController.getAllProjects);
router.get('/stats', ProjectController.getProjectStats);
router.get('/:projectId', ProjectController.getProject);
router.post('/', ProjectController.createProject);
router.put('/:projectId', ProjectController.updateProject);
router.delete('/:projectId', ProjectController.deleteProject);

// Project status operations
router.put('/:projectId/complete', ProjectController.completeProject);

module.exports = router;
