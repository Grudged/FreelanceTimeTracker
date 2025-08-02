const { Project, TimeEntry } = require('../models');

class ProjectController {
  // Get all projects for the authenticated user
  static async getAllProjects(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const status = req.query.status;
      const skip = (page - 1) * limit;

      let filter = { userId: req.user._id };
      if (status) {
        filter.status = status;
      }

      const projects = await Project.find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Project.countDocuments(filter);

      res.json({
        message: 'Projects retrieved successfully',
        projects,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: projects.length,
          totalProjects: total
        }
      });

    } catch (error) {
      console.error('Get projects error:', error);
      res.status(500).json({
        error: 'Failed to get projects',
        message: 'Unable to retrieve projects'
      });
    }
  }

  // Get a specific project
  static async getProject(req, res) {
    try {
      const { projectId } = req.params;

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

      // Get recent time entries for this project
      const timeEntries = await TimeEntry.find({ projectId })
        .sort({ date: -1 })
        .limit(10);

      res.json({
        message: 'Project retrieved successfully',
        project,
        recentTimeEntries: timeEntries
      });

    } catch (error) {
      console.error('Get project error:', error);
      res.status(500).json({
        error: 'Failed to get project',
        message: 'Unable to retrieve project'
      });
    }
  }

  // Create a new project
  static async createProject(req, res) {
    try {
      const {
        title,
        client,
        description,
        isContract,
        hourlyRate,
        currency,
        estimatedHours,
        tags,
        notes
      } = req.body;

      // Validation
      if (!title || !client || !hourlyRate) {
        return res.status(400).json({
          error: 'Missing required fields',
          message: 'Title, client, and hourly rate are required'
        });
      }

      if (hourlyRate <= 0) {
        return res.status(400).json({
          error: 'Invalid hourly rate',
          message: 'Hourly rate must be greater than 0'
        });
      }

      const project = new Project({
        title,
        client,
        description,
        isContract: isContract || false,
        hourlyRate,
        currency: currency || 'USD',
        estimatedHours,
        tags: tags || [],
        notes,
        userId: req.user._id
      });

      await project.save();

      res.status(201).json({
        message: 'Project created successfully',
        project
      });

    } catch (error) {
      console.error('Create project error:', error);
      res.status(500).json({
        error: 'Failed to create project',
        message: 'Unable to create project'
      });
    }
  }

  // Update a project
  static async updateProject(req, res) {
    try {
      const { projectId } = req.params;
      const updates = req.body;

      // Don't allow updating userId
      delete updates.userId;
      delete updates.totalHoursWorked;
      delete updates.totalEarnings;

      const project = await Project.findOneAndUpdate(
        { _id: projectId, userId: req.user._id },
        updates,
        { new: true, runValidators: true }
      );

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project was not found'
        });
      }

      res.json({
        message: 'Project updated successfully',
        project
      });

    } catch (error) {
      console.error('Update project error:', error);
      res.status(500).json({
        error: 'Failed to update project',
        message: 'Unable to update project'
      });
    }
  }

  // Delete a project
  static async deleteProject(req, res) {
    try {
      const { projectId } = req.params;

      const project = await Project.findOneAndDelete({
        _id: projectId,
        userId: req.user._id
      });

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project was not found'
        });
      }

      // Delete all time entries for this project
      await TimeEntry.deleteMany({ projectId });

      res.json({
        message: 'Project deleted successfully'
      });

    } catch (error) {
      console.error('Delete project error:', error);
      res.status(500).json({
        error: 'Failed to delete project',
        message: 'Unable to delete project'
      });
    }
  }

  // Complete a project
  static async completeProject(req, res) {
    try {
      const { projectId } = req.params;

      const project = await Project.findOneAndUpdate(
        { _id: projectId, userId: req.user._id },
        { status: 'completed', endDate: new Date() },
        { new: true }
      );

      if (!project) {
        return res.status(404).json({
          error: 'Project not found',
          message: 'The requested project was not found'
        });
      }

      res.json({
        message: 'Project marked as completed',
        project
      });

    } catch (error) {
      console.error('Complete project error:', error);
      res.status(500).json({
        error: 'Failed to complete project',
        message: 'Unable to complete project'
      });
    }
  }

  // Get project statistics
  static async getProjectStats(req, res) {
    try {
      const userId = req.user._id;

      const stats = await Project.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalHours: { $sum: '$totalHoursWorked' },
            totalEarnings: { $sum: '$totalEarnings' }
          }
        }
      ]);

      const overview = {
        total: 0,
        active: 0,
        completed: 0,
        paused: 0,
        totalHours: 0,
        totalEarnings: 0
      };

      stats.forEach(stat => {
        overview.total += stat.count;
        overview[stat._id] = stat.count;
        overview.totalHours += stat.totalHours;
        overview.totalEarnings += stat.totalEarnings;
      });

      res.json({
        message: 'Project statistics retrieved successfully',
        stats: overview
      });

    } catch (error) {
      console.error('Get project stats error:', error);
      res.status(500).json({
        error: 'Failed to get project statistics',
        message: 'Unable to retrieve project statistics'
      });
    }
  }
}

module.exports = ProjectController;
