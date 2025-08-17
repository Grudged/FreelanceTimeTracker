const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSaaSSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    default: null
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  organizations: [{
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization'
    },
    role: {
      type: String,
      enum: ['owner', 'admin', 'member', 'viewer'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  role: {
    type: String,
    enum: ['owner', 'admin', 'member', 'viewer'],
    default: 'member'
  },
  permissions: {
    canManageProjects: {
      type: Boolean,
      default: true
    },
    canManageTeam: {
      type: Boolean,
      default: false
    },
    canManageBilling: {
      type: Boolean,
      default: false
    },
    canViewReports: {
      type: Boolean,
      default: true
    },
    canExportData: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  lastLoginAt: Date,
  lastLoginIP: String,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date,
  preferences: {
    notifications: {
      email: {
        projectUpdates: {
          type: Boolean,
          default: true
        },
        weeklyReports: {
          type: Boolean,
          default: true
        },
        billingAlerts: {
          type: Boolean,
          default: true
        },
        teamInvites: {
          type: Boolean,
          default: true
        }
      },
      inApp: {
        projectUpdates: {
          type: Boolean,
          default: true
        },
        timerReminders: {
          type: Boolean,
          default: true
        },
        deadlineAlerts: {
          type: Boolean,
          default: true
        }
      }
    },
    dashboard: {
      defaultView: {
        type: String,
        enum: ['grid', 'list', 'calendar'],
        default: 'grid'
      },
      showCompletedProjects: {
        type: Boolean,
        default: false
      },
      defaultTimeRange: {
        type: String,
        enum: ['today', 'week', 'month', 'year'],
        default: 'week'
      }
    }
  },
  metadata: {
    signupSource: String,
    referralCode: String,
    utmCampaign: String,
    utmSource: String,
    utmMedium: String,
    onboardingStep: {
      type: Number,
      default: 0
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

userSaaSSchema.index({ email: 1, organizationId: 1 });
userSaaSSchema.index({ organizationId: 1 });
userSaaSSchema.index({ 'organizations.organizationId': 1 });

userSaaSSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSaaSSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSaaSSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSaaSSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.twoFactorSecret;
  delete user.emailVerificationToken;
  delete user.passwordResetToken;
  return user;
};

userSaaSSchema.methods.incLoginAttempts = function() {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000;
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }
  
  return this.updateOne(updates);
};

userSaaSSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

userSaaSSchema.methods.canAccessOrganization = function(organizationId) {
  return this.organizations.some(org => 
    org.organizationId.toString() === organizationId.toString()
  );
};

userSaaSSchema.methods.getRoleInOrganization = function(organizationId) {
  const org = this.organizations.find(o => 
    o.organizationId.toString() === organizationId.toString()
  );
  return org ? org.role : null;
};

userSaaSSchema.methods.addToOrganization = function(organizationId, role = 'member') {
  if (!this.canAccessOrganization(organizationId)) {
    this.organizations.push({
      organizationId,
      role,
      joinedAt: new Date(),
      isDefault: this.organizations.length === 0
    });
    
    if (this.organizations.length === 1) {
      this.organizationId = organizationId;
      this.role = role;
    }
  }
  return this.save();
};

userSaaSSchema.methods.removeFromOrganization = function(organizationId) {
  this.organizations = this.organizations.filter(org => 
    org.organizationId.toString() !== organizationId.toString()
  );
  
  if (this.organizationId.toString() === organizationId.toString() && this.organizations.length > 0) {
    const defaultOrg = this.organizations.find(o => o.isDefault) || this.organizations[0];
    this.organizationId = defaultOrg.organizationId;
    this.role = defaultOrg.role;
  }
  
  return this.save();
};

userSaaSSchema.methods.switchOrganization = function(organizationId) {
  const org = this.organizations.find(o => 
    o.organizationId.toString() === organizationId.toString()
  );
  
  if (org) {
    this.organizationId = organizationId;
    this.role = org.role;
    
    this.organizations.forEach(o => {
      o.isDefault = o.organizationId.toString() === organizationId.toString();
    });
    
    return this.save();
  }
  
  throw new Error('User does not have access to this organization');
};

userSaaSSchema.statics.findByEmail = function(email, organizationId) {
  const query = { email: email.toLowerCase() };
  if (organizationId) {
    query['organizations.organizationId'] = organizationId;
  }
  return this.findOne(query);
};

module.exports = mongoose.model('UserSaaS', userSaaSSchema);