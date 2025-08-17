const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    enum: ['starter', 'pro', 'team', 'agency'],
    default: 'starter'
  },
  subscriptionId: {
    type: String,
    default: null
  },
  customerId: {
    type: String,
    default: null
  },
  trialStartDate: {
    type: Date,
    default: Date.now
  },
  trialEndDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }
  },
  isTrialActive: {
    type: Boolean,
    default: true
  },
  subscriptionStatus: {
    type: String,
    enum: ['trialing', 'active', 'past_due', 'canceled', 'incomplete', 'incomplete_expired'],
    default: 'trialing'
  },
  billingEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  settings: {
    timeZone: {
      type: String,
      default: 'America/New_York'
    },
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD']
    },
    timeFormat: {
      type: String,
      default: '12h',
      enum: ['12h', '24h']
    },
    weekStartsOn: {
      type: String,
      default: 'sunday',
      enum: ['sunday', 'monday']
    },
    branding: {
      primaryColor: {
        type: String,
        default: '#667eea'
      },
      logoUrl: {
        type: String,
        default: null
      },
      customDomain: {
        type: String,
        default: null
      }
    },
    features: {
      clientPortal: {
        type: Boolean,
        default: false
      },
      whiteLabel: {
        type: Boolean,
        default: false
      },
      apiAccess: {
        type: Boolean,
        default: false
      },
      advancedReporting: {
        type: Boolean,
        default: false
      },
      teamCollaboration: {
        type: Boolean,
        default: false
      }
    }
  },
  limits: {
    maxUsers: {
      type: Number,
      default: 1
    },
    maxProjects: {
      type: Number,
      default: 5
    },
    maxClients: {
      type: Number,
      default: 10
    },
    maxStorageGB: {
      type: Number,
      default: 1
    }
  },
  usage: {
    currentUsers: {
      type: Number,
      default: 1
    },
    currentProjects: {
      type: Number,
      default: 0
    },
    currentClients: {
      type: Number,
      default: 0
    },
    currentStorageGB: {
      type: Number,
      default: 0
    }
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
    }
  }],
  integrations: {
    slack: {
      enabled: {
        type: Boolean,
        default: false
      },
      webhookUrl: String,
      channelId: String
    },
    zapier: {
      enabled: {
        type: Boolean,
        default: false
      },
      apiKey: String
    },
    googleCalendar: {
      enabled: {
        type: Boolean,
        default: false
      },
      refreshToken: String
    }
  },
  metadata: {
    onboardingCompleted: {
      type: Boolean,
      default: false
    },
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    industry: String,
    companySize: String,
    referralSource: String
  }
}, {
  timestamps: true
});

organizationSchema.index({ slug: 1 });
organizationSchema.index({ ownerId: 1 });
organizationSchema.index({ 'members.userId': 1 });
organizationSchema.index({ subscriptionStatus: 1, trialEndDate: 1 });

organizationSchema.methods.generateSlug = function(baseName) {
  const slug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return slug + '-' + Date.now().toString(36);
};

organizationSchema.methods.canAddUser = function() {
  return this.usage.currentUsers < this.limits.maxUsers;
};

organizationSchema.methods.canAddProject = function() {
  return this.usage.currentProjects < this.limits.maxProjects;
};

organizationSchema.methods.isUserMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString()
  );
};

organizationSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(m => 
    m.userId.toString() === userId.toString()
  );
  return member ? member.role : null;
};

organizationSchema.methods.updatePlanLimits = function(plan) {
  const planLimits = {
    starter: {
      maxUsers: 1,
      maxProjects: 5,
      maxClients: 10,
      maxStorageGB: 1
    },
    pro: {
      maxUsers: 1,
      maxProjects: -1,
      maxClients: -1,
      maxStorageGB: 10
    },
    team: {
      maxUsers: 5,
      maxProjects: -1,
      maxClients: -1,
      maxStorageGB: 50
    },
    agency: {
      maxUsers: -1,
      maxProjects: -1,
      maxClients: -1,
      maxStorageGB: 500
    }
  };

  const planFeatures = {
    starter: {
      clientPortal: false,
      whiteLabel: false,
      apiAccess: false,
      advancedReporting: false,
      teamCollaboration: false
    },
    pro: {
      clientPortal: false,
      whiteLabel: false,
      apiAccess: false,
      advancedReporting: true,
      teamCollaboration: false
    },
    team: {
      clientPortal: true,
      whiteLabel: false,
      apiAccess: true,
      advancedReporting: true,
      teamCollaboration: true
    },
    agency: {
      clientPortal: true,
      whiteLabel: true,
      apiAccess: true,
      advancedReporting: true,
      teamCollaboration: true
    }
  };

  this.plan = plan;
  this.limits = planLimits[plan];
  this.settings.features = planFeatures[plan];
  
  return this.save();
};

organizationSchema.methods.checkTrialExpiry = function() {
  if (this.isTrialActive && this.trialEndDate < new Date()) {
    this.isTrialActive = false;
    this.subscriptionStatus = 'incomplete';
    return this.save();
  }
  return Promise.resolve(this);
};

organizationSchema.virtual('daysLeftInTrial').get(function() {
  if (!this.isTrialActive) return 0;
  
  const now = new Date();
  const trialEnd = new Date(this.trialEndDate);
  const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysLeft);
});

organizationSchema.virtual('isActive').get(function() {
  return this.subscriptionStatus === 'active' || 
         (this.subscriptionStatus === 'trialing' && this.isTrialActive);
});

organizationSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Organization', organizationSchema);