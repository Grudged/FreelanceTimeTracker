const express = require('express');
const TimeEntryController = require('../controllers/TimeEntryController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All time entry routes require authentication
router.use(authenticateToken);

// Time entry operations
router.get('/', TimeEntryController.getAllTimeEntries);
router.get('/stats', TimeEntryController.getTimeStats);
router.get('/daily-summary', TimeEntryController.getDailySummary);
router.get('/project/:projectId', TimeEntryController.getTimeEntries);
router.post('/', TimeEntryController.createTimeEntry);
router.put('/:timeEntryId', TimeEntryController.updateTimeEntry);
router.delete('/:timeEntryId', TimeEntryController.deleteTimeEntry);

module.exports = router;
