const mongoose = require('mongoose');

const timeEntrySchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  hoursWorked: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  workLog: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  isBreakTime: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Calculate hours worked before saving
timeEntrySchema.pre('save', function(next) {
  if (this.startTime && this.endTime) {
    const diffMs = this.endTime - this.startTime;
    this.hoursWorked = diffMs / (1000 * 60 * 60); // Convert to hours
  }
  next();
});

// Note: Project totals will be updated in the controller to avoid circular dependency issues

// Virtual for formatted duration
timeEntrySchema.virtual('formattedDuration').get(function() {
  const hours = Math.floor(this.hoursWorked);
  const minutes = Math.round((this.hoursWorked - hours) * 60);
  return `${hours}h ${minutes}m`;
});

// Virtual for earnings for this entry
timeEntrySchema.virtual('earnings').get(function() {
  // This will be populated when the project is populated
  if (this.project && this.project.hourlyRate) {
    return this.hoursWorked * this.project.hourlyRate;
  }
  return 0;
});

timeEntrySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
