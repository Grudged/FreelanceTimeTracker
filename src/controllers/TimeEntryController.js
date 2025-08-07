const { TimeEntry, Project } = require('../models');
const mongoose = require('mongoose');

class TimeEntryController {
  // Get all time entries for a project
  static async getTimeEntries(req, res) {
    try {
      const { projectId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      // Verify project belongs to user
      const project = await Project.findOne({
        _id: projectId,
        userId: req.user._id
      });

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project was not found'
        });
      }

      const timeEntries = await TimeEntry.find({ projectId })
        .populate('projectId', 'title client hourlyRate')
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(limit);

      const total = await TimeEntry.countDocuments({ projectId });

      res.json({
        message: 'Time entries retrieved successfully',
        timeEntries,
        project: {
          id: project._id,
          title: project.title,
          client: project.client
        },
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: timeEntries.length,
          totalEntries: total
        }
      });

    } catch (error) {
      console.error('Get time entries error:', error);
      res.status(500).json({
        error: 'Failed to get time entries',
        message: 'Unable to retrieve time entries'
      });
    }
  }

  // Get all time entries for user (across all projects)
  static async getAllTimeEntries(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const timeEntries = await TimeEntry.find({ userId: req.user._id })
        .populate('projectId', 'title client hourlyRate currency')
        .sort({ date: -1, startTime: -1 })
        .skip(skip)
        .limit(limit);

      const total = await TimeEntry.countDocuments({ userId: req.user._id });

      res.json({
        message: 'Time entries retrieved successfully',
        timeEntries,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: timeEntries.length,
          totalEntries: total
        }
      });

    } catch (error) {
      console.error('Get all time entries error:', error);
      res.status(500).json({
        error: 'Failed to get time entries',
        message: 'Unable to retrieve time entries'
      });
    }
  }

  // Create a new time entry
  static async createTimeEntry(req, res) {
    try {
      console.log('Creating time entry with request body:', req.body);
      console.log('User ID:', req.user._id);
      
      const {
        projectId,
        startTime,
        endTime,
        description,
        workLog,
        date,
        tags
      } = req.body;

      // Validation
      if (!projectId || !startTime || !endTime) {
        console.log('Validation failed - missing required fields:', { projectId: !!projectId, startTime: !!startTime, endTime: !!endTime });
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Project ID, start time, and end time are required'
        });
      }

      // Validate ObjectId format for projectId
      if (!mongoose.Types.ObjectId.isValid(projectId)) {
        console.log('Invalid ObjectId format for projectId:', projectId);
        return res.status(400).json({
          error: 'Invalid project ID',
          message: 'Project ID must be a valid ObjectId'
        });
      }

      // Verify project belongs to user
      console.log('Looking for project:', projectId, 'for user:', req.user._id);
      let project;
      try {
        project = await Project.findOne({
          _id: projectId,
          userId: req.user._id
        });
      } catch (dbError) {
        console.error('Database error while finding project:', dbError);
        return res.status(500).json({
          error: 'Database error',
          message: 'Error looking up project'
        });
      }

      if (!project) {
        console.log('Project not found or does not belong to user');
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project was not found'
        });
      }

      console.log('Project found:', project.title);

      // Validate time entries
      const start = new Date(startTime);
      const end = new Date(endTime);

      console.log('Parsed dates - start:', start, 'end:', end);

      if (start >= end) {
        console.log('Invalid time range - start >= end');
        return res.status(400).json({
          error: 'Invalid time range',
          message: 'End time must be after start time'
        });
      }

      const timeEntryData = {
        projectId,
        userId: req.user._id,
        startTime: start,
        endTime: end,
        description,
        workLog,
        date: date ? new Date(date) : new Date(),
        tags: tags || []
      };

      console.log('Creating time entry with data:', timeEntryData);

      let timeEntry;
      try {
        timeEntry = new TimeEntry(timeEntryData);
        await timeEntry.save();
        console.log('Time entry saved successfully');
      } catch (saveError) {
        console.error('Error saving time entry:', saveError);
        return res.status(500).json({
          error: 'Database save error',
          message: `Failed to save time entry: ${saveError.message}`,
          details: saveError
        });
      }

      // Update project totals manually
      try {
        console.log('Updating project totals...');
        await project.updateTotals();
        console.log('Project totals updated successfully');
      } catch (updateError) {
        console.error('Error updating project totals:', updateError);
        // Don't fail the request if project update fails
      }

      // Populate the project data for response
      try {
        await timeEntry.populate('projectId', 'title client hourlyRate currency');
      } catch (populateError) {
        console.error('Error populating project data:', populateError);
        // Continue without failing the request
      }

      res.status(201).json({
        message: 'Time entry created successfully',
        timeEntry
      });

    } catch (error) {
      console.error('Create time entry error:', error);
      res.status(500).json({
        error: 'Failed to create time entry',
        message: 'Unable to create time entry'
      });
    }
  }

  // Update a time entry
  static async updateTimeEntry(req, res) {
    try {
      const { timeEntryId } = req.params;
      const updates = req.body;

      // Don't allow updating projectId or userId
      delete updates.projectId;
      delete updates.userId;

      // If updating times, recalculate hours
      if (updates.startTime || updates.endTime) {
        const timeEntry = await TimeEntry.findOne({
          _id: timeEntryId,
          userId: req.user._id
        });

        if (!timeEntry) {
          return res.status(404).json({
            error: 'Time entry not found',
            message: 'The requested time entry was not found'
          });
        }

        const startTime = new Date(updates.startTime || timeEntry.startTime);
        const endTime = new Date(updates.endTime || timeEntry.endTime);

        if (startTime >= endTime) {
          return res.status(400).json({
            error: 'Invalid time range',
            message: 'End time must be after start time'
          });
        }

        updates.startTime = startTime;
        updates.endTime = endTime;
      }

      const timeEntry = await TimeEntry.findOneAndUpdate(
        { _id: timeEntryId, userId: req.user._id },
        updates,
        { new: true, runValidators: true }
      ).populate('projectId', 'title client hourlyRate currency');

      if (!timeEntry) {
        return res.status(404).json({
          error: 'Time entry not found',
          message: 'The requested time entry was not found'
        });
      }

      // Update project totals after update
      try {
        const project = await Project.findById(timeEntry.projectId._id);
        if (project) {
          await project.updateTotals();
        }
      } catch (updateError) {
        console.error('Error updating project totals after update:', updateError);
        // Don't fail the request if project update fails
      }

      res.json({
        message: 'Time entry updated successfully',
        timeEntry
      });

    } catch (error) {
      console.error('Update time entry error:', error);
      res.status(500).json({
        error: 'Failed to update time entry',
        message: 'Unable to update time entry'
      });
    }
  }

  // Delete a time entry
  static async deleteTimeEntry(req, res) {
    try {
      const { timeEntryId } = req.params;

      const timeEntry = await TimeEntry.findOneAndDelete({
        _id: timeEntryId,
        userId: req.user._id
      });

      if (!timeEntry) {
        return res.status(404).json({
          error: 'Time entry not found',
          message: 'The requested time entry was not found'
        });
      }

      // Update project totals after deletion
      try {
        const project = await Project.findById(timeEntry.projectId);
        if (project) {
          await project.updateTotals();
        }
      } catch (updateError) {
        console.error('Error updating project totals after deletion:', updateError);
        // Don't fail the request if project update fails
      }

      res.json({
        message: 'Time entry deleted successfully'
      });

    } catch (error) {
      console.error('Delete time entry error:', error);
      res.status(500).json({
        error: 'Failed to delete time entry',
        message: 'Unable to delete time entry'
      });
    }
  }

  // Get time entry statistics
  static async getTimeStats(req, res) {
    try {
      const { projectId } = req.query;
      const { period } = req.query; // 'week', 'month', 'year'

      let matchCondition = { userId: req.user._id };
      
      if (projectId) {
        matchCondition.projectId = projectId;
      }

      // Date range for period
      let dateRange = {};
      const now = new Date();
      
      switch (period) {
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);
          dateRange = { date: { $gte: weekStart } };
          break;
        case 'month':
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          dateRange = { date: { $gte: monthStart } };
          break;
        case 'year':
          const yearStart = new Date(now.getFullYear(), 0, 1);
          dateRange = { date: { $gte: yearStart } };
          break;
      }

      matchCondition = { ...matchCondition, ...dateRange };

      const stats = await TimeEntry.aggregate([
        { $match: matchCondition },
        {
          $lookup: {
            from: 'projects',
            localField: 'projectId',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: '$project' },
        {
          $group: {
            _id: null,
            totalHours: { $sum: '$hoursWorked' },
            totalEarnings: { $sum: { $multiply: ['$hoursWorked', '$project.hourlyRate'] } },
            entriesCount: { $sum: 1 },
            avgHoursPerEntry: { $avg: '$hoursWorked' }
          }
        }
      ]);

      const result = stats[0] || {
        totalHours: 0,
        totalEarnings: 0,
        entriesCount: 0,
        avgHoursPerEntry: 0
      };

      res.json({
        message: 'Time statistics retrieved successfully',
        stats: result,
        period: period || 'all_time'
      });

    } catch (error) {
      console.error('Get time stats error:', error);
      res.status(500).json({
        error: 'Failed to get time statistics',
        message: 'Unable to retrieve time statistics'
      });
    }
  }

  // Get daily time summary
  static async getDailySummary(req, res) {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date) : new Date();
      
      // Set to start and end of day
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const timeEntries = await TimeEntry.find({
        userId: req.user._id,
        date: { $gte: startOfDay, $lte: endOfDay }
      }).populate('projectId', 'title client hourlyRate currency');

      const summary = timeEntries.reduce((acc, entry) => {
        acc.totalHours += entry.hoursWorked;
        acc.totalEarnings += entry.hoursWorked * entry.projectId.hourlyRate;
        return acc;
      }, {
        totalHours: 0,
        totalEarnings: 0,
        entriesCount: timeEntries.length
      });

      res.json({
        message: 'Daily summary retrieved successfully',
        date: targetDate.toISOString().split('T')[0],
        summary,
        timeEntries
      });

    } catch (error) {
      console.error('Get daily summary error:', error);
      res.status(500).json({
        error: 'Failed to get daily summary',
        message: 'Unable to retrieve daily summary'
      });
    }
  }
}

module.exports = TimeEntryController;
