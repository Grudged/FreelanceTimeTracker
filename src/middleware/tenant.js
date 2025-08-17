const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');

const tenantMiddleware = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const organizationId = req.user.organizationId || 
                          req.headers['x-organization-id'] || 
                          req.query.organizationId ||
                          req.body.organizationId;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: 'Organization context required'
      });
    }

    const organization = await Organization.findById(organizationId);
    
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found'
      });
    }

    if (!organization.isUserMember(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this organization'
      });
    }

    await organization.checkTrialExpiry();

    if (!organization.isActive) {
      return res.status(402).json({
        success: false,
        message: 'Organization subscription is not active',
        requiresPayment: true,
        trialExpired: !organization.isTrialActive,
        daysLeftInTrial: organization.daysLeftInTrial
      });
    }

    req.organization = organization;
    req.organizationId = organizationId;
    req.userRole = organization.getUserRole(req.user._id);

    req.tenant = {
      id: organizationId,
      organization: organization,
      role: req.userRole,
      plan: organization.plan,
      limits: organization.limits,
      usage: organization.usage,
      features: organization.settings.features
    };

    next();
  } catch (error) {
    console.error('Tenant middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating organization context'
    });
  }
};

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.tenant) {
      return res.status(500).json({
        success: false,
        message: 'Tenant context not initialized'
      });
    }

    if (!allowedRoles.includes(req.tenant.role)) {
      return res.status(403).json({
        success: false,
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
        currentRole: req.tenant.role
      });
    }

    next();
  };
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.permissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    if (!req.user.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `This action requires ${permission} permission`
      });
    }

    next();
  };
};

const checkUsageLimit = (resource) => {
  return async (req, res, next) => {
    if (!req.tenant) {
      return res.status(500).json({
        success: false,
        message: 'Tenant context not initialized'
      });
    }

    const { limits, usage } = req.tenant;
    
    const resourceMap = {
      'users': { limit: 'maxUsers', current: 'currentUsers' },
      'projects': { limit: 'maxProjects', current: 'currentProjects' },
      'clients': { limit: 'maxClients', current: 'currentClients' },
      'storage': { limit: 'maxStorageGB', current: 'currentStorageGB' }
    };

    const mapping = resourceMap[resource];
    if (!mapping) {
      return next();
    }

    const limit = limits[mapping.limit];
    const current = usage[mapping.current];

    if (limit !== -1 && current >= limit) {
      const subscription = await Subscription.findOne({ 
        organizationId: req.organizationId 
      });

      return res.status(403).json({
        success: false,
        message: `You have reached your ${resource} limit`,
        limit: limit,
        current: current,
        plan: req.tenant.plan,
        upgradeRequired: true,
        upgradeUrl: `/billing/upgrade?from=${req.tenant.plan}`,
        subscription: subscription ? {
          status: subscription.status,
          willRenew: subscription.willRenew()
        } : null
      });
    }

    next();
  };
};

const requireFeature = (feature) => {
  return (req, res, next) => {
    if (!req.tenant || !req.tenant.features) {
      return res.status(500).json({
        success: false,
        message: 'Tenant context not initialized'
      });
    }

    if (!req.tenant.features[feature]) {
      return res.status(403).json({
        success: false,
        message: `This feature requires a higher plan`,
        feature: feature,
        currentPlan: req.tenant.plan,
        upgradeRequired: true,
        upgradeUrl: `/billing/upgrade?feature=${feature}&from=${req.tenant.plan}`
      });
    }

    next();
  };
};

const applyTenantFilter = (model) => {
  return (req, res, next) => {
    if (!req.organizationId) {
      return res.status(500).json({
        success: false,
        message: 'Organization context required for data filtering'
      });
    }

    const originalFind = model.find;
    const originalFindOne = model.findOne;
    const originalFindById = model.findById;
    const originalCountDocuments = model.countDocuments;
    const originalAggregate = model.aggregate;

    model.find = function(filter = {}, ...args) {
      filter.organizationId = req.organizationId;
      return originalFind.call(this, filter, ...args);
    };

    model.findOne = function(filter = {}, ...args) {
      filter.organizationId = req.organizationId;
      return originalFindOne.call(this, filter, ...args);
    };

    model.findById = function(id, ...args) {
      return originalFindById.call(this, id, ...args).then(doc => {
        if (doc && doc.organizationId && 
            doc.organizationId.toString() !== req.organizationId.toString()) {
          return null;
        }
        return doc;
      });
    };

    model.countDocuments = function(filter = {}, ...args) {
      filter.organizationId = req.organizationId;
      return originalCountDocuments.call(this, filter, ...args);
    };

    model.aggregate = function(pipeline = [], ...args) {
      pipeline.unshift({
        $match: { organizationId: mongoose.Types.ObjectId(req.organizationId) }
      });
      return originalAggregate.call(this, pipeline, ...args);
    };

    res.on('finish', () => {
      model.find = originalFind;
      model.findOne = originalFindOne;
      model.findById = originalFindById;
      model.countDocuments = originalCountDocuments;
      model.aggregate = originalAggregate;
    });

    next();
  };
};

const trackUsage = (resource, amount = 1) => {
  return async (req, res, next) => {
    if (!req.organization) {
      return next();
    }

    try {
      const usageField = `usage.current${resource.charAt(0).toUpperCase() + resource.slice(1)}`;
      
      await Organization.findByIdAndUpdate(
        req.organizationId,
        { $inc: { [usageField]: amount } }
      );

      const subscription = await Subscription.findOne({ 
        organizationId: req.organizationId 
      });
      
      if (subscription) {
        const usageKey = `usage.${resource}.current`;
        await Subscription.findByIdAndUpdate(
          subscription._id,
          { $inc: { [usageKey]: amount } }
        );
      }

      next();
    } catch (error) {
      console.error('Usage tracking error:', error);
      next();
    }
  };
};

const validateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ 
      organizationId: req.organizationId 
    });

    if (!subscription) {
      req.subscription = null;
      return next();
    }

    if (subscription.status === 'past_due') {
      return res.status(402).json({
        success: false,
        message: 'Payment is past due. Please update your payment method.',
        subscriptionStatus: subscription.status,
        updatePaymentUrl: '/billing/payment-method'
      });
    }

    if (subscription.status === 'canceled' && 
        new Date() > new Date(subscription.currentPeriodEnd)) {
      return res.status(402).json({
        success: false,
        message: 'Your subscription has ended. Please reactivate to continue.',
        subscriptionStatus: subscription.status,
        reactivateUrl: '/billing/reactivate'
      });
    }

    req.subscription = subscription;
    next();
  } catch (error) {
    console.error('Subscription validation error:', error);
    next();
  }
};

module.exports = {
  tenantMiddleware,
  requireRole,
  requirePermission,
  checkUsageLimit,
  requireFeature,
  applyTenantFilter,
  trackUsage,
  validateSubscription
};