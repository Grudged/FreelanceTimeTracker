const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  client: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  isContract: {
    type: Boolean,
    default: false
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: null
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: null
  },
  totalHoursWorked: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarnings: {
    type: Number,
    default: 0,
    min: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 2000
  }
}, {
  timestamps: true
});

// Calculate total hours and earnings when time entries change
projectSchema.methods.updateTotals = async function() {
  const TimeEntry = mongoose.model('TimeEntry');
  const timeEntries = await TimeEntry.find({ projectId: this._id });
  
  this.totalHoursWorked = timeEntries.reduce((total, entry) => total + entry.hoursWorked, 0);
  this.totalEarnings = this.totalHoursWorked * this.hourlyRate;
  
  return this.save();
};

// Virtual for formatted earnings
projectSchema.virtual('formattedEarnings').get(function() {
  return `${this.currency} ${this.totalEarnings.toFixed(2)}`;
});

// Virtual for project duration
projectSchema.virtual('projectDuration').get(function() {
  const start = this.startDate;
  const end = this.endDate || new Date();
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

projectSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Project', projectSchema);
