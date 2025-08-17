const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true,
    unique: true
  },
  stripeCustomerId: {
    type: String,
    required: true,
    index: true
  },
  stripeSubscriptionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  stripePriceId: {
    type: String,
    required: true
  },
  stripeProductId: {
    type: String,
    required: true
  },
  plan: {
    type: String,
    enum: ['starter', 'pro', 'team', 'agency'],
    required: true
  },
  status: {
    type: String,
    enum: [
      'trialing',
      'active', 
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid',
      'paused'
    ],
    required: true
  },
  currentPeriodStart: {
    type: Date,
    required: true
  },
  currentPeriodEnd: {
    type: Date,
    required: true
  },
  canceledAt: Date,
  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },
  trialStart: Date,
  trialEnd: Date,
  billingInterval: {
    type: String,
    enum: ['month', 'year'],
    default: 'month'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'usd',
    lowercase: true
  },
  paymentMethod: {
    id: String,
    brand: String,
    last4: String,
    expMonth: Number,
    expYear: Number
  },
  latestInvoice: {
    id: String,
    number: String,
    amountDue: Number,
    amountPaid: Number,
    status: String,
    hostedInvoiceUrl: String,
    pdfUrl: String,
    createdAt: Date
  },
  upcomingInvoice: {
    amountDue: Number,
    currency: String,
    periodStart: Date,
    periodEnd: Date
  },
  discount: {
    coupon: {
      id: String,
      name: String,
      percentOff: Number,
      amountOff: Number,
      duration: String,
      durationInMonths: Number
    },
    start: Date,
    end: Date
  },
  metadata: {
    referralCode: String,
    salesRep: String,
    customNotes: String,
    upgradedFrom: String,
    downgradedFrom: String
  },
  usage: {
    users: {
      current: {
        type: Number,
        default: 1
      },
      limit: Number,
      overage: {
        type: Number,
        default: 0
      }
    },
    projects: {
      current: {
        type: Number,
        default: 0
      },
      limit: Number,
      overage: {
        type: Number,
        default: 0
      }
    },
    storage: {
      currentGB: {
        type: Number,
        default: 0
      },
      limitGB: Number,
      overageGB: {
        type: Number,
        default: 0
      }
    }
  },
  billingHistory: [{
    invoiceId: String,
    date: Date,
    amount: Number,
    currency: String,
    status: String,
    description: String,
    pdfUrl: String,
    hostedUrl: String
  }],
  planHistory: [{
    plan: String,
    startDate: Date,
    endDate: Date,
    reason: String,
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  webhookEvents: [{
    eventId: String,
    eventType: String,
    createdAt: Date,
    processed: {
      type: Boolean,
      default: false
    },
    error: String
  }],
  features: {
    maxUsers: Number,
    maxProjects: Number,
    maxClients: Number,
    maxStorageGB: Number,
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
    },
    customIntegrations: {
      type: Boolean,
      default: false
    },
    prioritySupport: {
      type: Boolean,
      default: false
    },
    sla: {
      type: Boolean,
      default: false
    }
  },
  notifications: {
    paymentFailed: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      attempts: {
        type: Number,
        default: 0
      }
    },
    trialEnding: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    subscriptionRenewing: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    usageLimitWarning: {
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      threshold: Number
    }
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ organizationId: 1 });
subscriptionSchema.index({ stripeCustomerId: 1 });
subscriptionSchema.index({ stripeSubscriptionId: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ currentPeriodEnd: 1 });
subscriptionSchema.index({ plan: 1, status: 1 });

subscriptionSchema.methods.isActive = function() {
  return ['active', 'trialing'].includes(this.status);
};

subscriptionSchema.methods.willRenew = function() {
  return this.status === 'active' && !this.cancelAtPeriodEnd;
};

subscriptionSchema.methods.daysUntilRenewal = function() {
  if (!this.willRenew()) return null;
  
  const now = new Date();
  const renewalDate = new Date(this.currentPeriodEnd);
  const daysLeft = Math.ceil((renewalDate - now) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysLeft);
};

subscriptionSchema.methods.isInTrial = function() {
  return this.status === 'trialing' && this.trialEnd && new Date() < new Date(this.trialEnd);
};

subscriptionSchema.methods.daysLeftInTrial = function() {
  if (!this.isInTrial()) return 0;
  
  const now = new Date();
  const trialEndDate = new Date(this.trialEnd);
  const daysLeft = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysLeft);
};

subscriptionSchema.methods.getPlanFeatures = function() {
  const planFeatures = {
    starter: {
      maxUsers: 1,
      maxProjects: 5,
      maxClients: 10,
      maxStorageGB: 1,
      clientPortal: false,
      whiteLabel: false,
      apiAccess: false,
      advancedReporting: false,
      teamCollaboration: false,
      customIntegrations: false,
      prioritySupport: false,
      sla: false
    },
    pro: {
      maxUsers: 1,
      maxProjects: -1,
      maxClients: -1,
      maxStorageGB: 10,
      clientPortal: false,
      whiteLabel: false,
      apiAccess: false,
      advancedReporting: true,
      teamCollaboration: false,
      customIntegrations: false,
      prioritySupport: false,
      sla: false
    },
    team: {
      maxUsers: 5,
      maxProjects: -1,
      maxClients: -1,
      maxStorageGB: 50,
      clientPortal: true,
      whiteLabel: false,
      apiAccess: true,
      advancedReporting: true,
      teamCollaboration: true,
      customIntegrations: true,
      prioritySupport: true,
      sla: false
    },
    agency: {
      maxUsers: -1,
      maxProjects: -1,
      maxClients: -1,
      maxStorageGB: 500,
      clientPortal: true,
      whiteLabel: true,
      apiAccess: true,
      advancedReporting: true,
      teamCollaboration: true,
      customIntegrations: true,
      prioritySupport: true,
      sla: true
    }
  };
  
  return planFeatures[this.plan] || planFeatures.starter;
};

subscriptionSchema.methods.checkUsageLimits = function() {
  const features = this.getPlanFeatures();
  const warnings = [];
  
  if (features.maxUsers !== -1 && this.usage.users.current >= features.maxUsers * 0.8) {
    warnings.push({
      type: 'users',
      message: `Approaching user limit (${this.usage.users.current}/${features.maxUsers})`
    });
  }
  
  if (features.maxProjects !== -1 && this.usage.projects.current >= features.maxProjects * 0.8) {
    warnings.push({
      type: 'projects',
      message: `Approaching project limit (${this.usage.projects.current}/${features.maxProjects})`
    });
  }
  
  if (features.maxStorageGB !== -1 && this.usage.storage.currentGB >= features.maxStorageGB * 0.8) {
    warnings.push({
      type: 'storage',
      message: `Approaching storage limit (${this.usage.storage.currentGB}/${features.maxStorageGB} GB)`
    });
  }
  
  return warnings;
};

subscriptionSchema.methods.canUpgradeTo = function(newPlan) {
  const planHierarchy = ['starter', 'pro', 'team', 'agency'];
  const currentIndex = planHierarchy.indexOf(this.plan);
  const newIndex = planHierarchy.indexOf(newPlan);
  
  return newIndex > currentIndex;
};

subscriptionSchema.methods.canDowngradeTo = function(newPlan) {
  const planHierarchy = ['starter', 'pro', 'team', 'agency'];
  const currentIndex = planHierarchy.indexOf(this.plan);
  const newIndex = planHierarchy.indexOf(newPlan);
  
  if (newIndex >= currentIndex) return false;
  
  const newFeatures = this.getPlanFeatures.call({ plan: newPlan });
  
  if (newFeatures.maxUsers !== -1 && this.usage.users.current > newFeatures.maxUsers) {
    return false;
  }
  if (newFeatures.maxProjects !== -1 && this.usage.projects.current > newFeatures.maxProjects) {
    return false;
  }
  if (newFeatures.maxStorageGB !== -1 && this.usage.storage.currentGB > newFeatures.maxStorageGB) {
    return false;
  }
  
  return true;
};

subscriptionSchema.methods.calculateProration = function(newPlan, newAmount) {
  const now = new Date();
  const periodEnd = new Date(this.currentPeriodEnd);
  const periodStart = new Date(this.currentPeriodStart);
  
  const totalDays = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
  const remainingDays = Math.ceil((periodEnd - now) / (1000 * 60 * 60 * 24));
  
  const dailyCurrentRate = this.amount / totalDays;
  const dailyNewRate = newAmount / totalDays;
  
  const unusedAmount = dailyCurrentRate * remainingDays;
  const newAmount = dailyNewRate * remainingDays;
  
  return {
    credit: unusedAmount,
    charge: newAmount,
    net: newAmount - unusedAmount,
    remainingDays
  };
};

subscriptionSchema.virtual('mrr').get(function() {
  if (!this.isActive()) return 0;
  
  if (this.billingInterval === 'year') {
    return this.amount / 12;
  }
  return this.amount;
});

subscriptionSchema.virtual('arr').get(function() {
  if (!this.isActive()) return 0;
  
  if (this.billingInterval === 'year') {
    return this.amount;
  }
  return this.amount * 12;
});

subscriptionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);