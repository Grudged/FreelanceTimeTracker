const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const Subscription = require('../models/Subscription');
const Organization = require('../models/Organization');
const { 
  tenantMiddleware, 
  requireRole,
  validateSubscription 
} = require('../middleware/tenant');
const authMiddleware = require('../middleware/auth');

// Get current subscription
router.get('/subscription', 
  authMiddleware, 
  tenantMiddleware,
  async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      organizationId: req.organizationId 
    });

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        isTrialing: req.organization.isTrialActive,
        daysLeftInTrial: req.organization.daysLeftInTrial
      });
    }

    const metrics = await stripeService.getSubscriptionMetrics(req.organizationId);

    res.json({
      success: true,
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        amount: subscription.amount,
        currency: subscription.currency,
        billingInterval: subscription.billingInterval,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        isActive: subscription.isActive(),
        willRenew: subscription.willRenew(),
        daysUntilRenewal: subscription.daysUntilRenewal(),
        isInTrial: subscription.isInTrial(),
        daysLeftInTrial: subscription.daysLeftInTrial(),
        features: subscription.features,
        paymentMethod: subscription.paymentMethod
      },
      metrics,
      billingHistory: subscription.billingHistory.slice(-10)
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription'
    });
  }
});

// Create subscription (after trial or for new plan)
router.post('/subscribe', 
  authMiddleware, 
  tenantMiddleware,
  requireRole('owner', 'admin'),
  async (req, res) => {
  try {
    const { plan, billingInterval, paymentMethodId } = req.body;

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({ 
      organizationId: req.organizationId 
    });

    if (existingSubscription && existingSubscription.isActive()) {
      return res.status(400).json({
        success: false,
        message: 'Active subscription already exists. Please upgrade or change your plan instead.'
      });
    }

    const result = await stripeService.createSubscription(
      req.organizationId,
      plan,
      billingInterval,
      paymentMethodId
    );

    res.json({
      success: true,
      message: 'Subscription created successfully',
      subscription: result.subscription,
      clientSecret: result.clientSecret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
});

// Create checkout session for subscription
router.post('/create-checkout-session', 
  authMiddleware, 
  tenantMiddleware,
  requireRole('owner', 'admin'),
  async (req, res) => {
  try {
    const { plan, billingInterval } = req.body;
    
    const successUrl = `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.FRONTEND_URL}/billing/canceled`;

    const session = await stripeService.createCheckoutSession(
      req.organizationId,
      plan,
      billingInterval,
      successUrl,
      cancelUrl
    );

    res.json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session',
      error: error.message
    });
  }
});

// Update subscription plan
router.put('/subscription/plan', 
  authMiddleware, 
  tenantMiddleware,
  requireRole('owner', 'admin'),
  validateSubscription,
  async (req, res) => {
  try {
    const { plan, billingInterval } = req.body;

    if (!req.subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    // Check if downgrade is possible
    if (!req.subscription.canUpgradeTo(plan) && !req.subscription.canDowngradeTo(plan)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change to this plan due to current usage limits'
      });
    }

    const updatedSubscription = await stripeService.updateSubscription(
      req.subscription.stripeSubscriptionId,
      plan,
      billingInterval
    );

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      subscription: updatedSubscription
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
});

// Cancel subscription
router.post('/subscription/cancel', 
  authMiddleware, 
  tenantMiddleware,
  requireRole('owner'),
  validateSubscription,
  async (req, res) => {
  try {
    const { immediately = false, reason, feedback } = req.body;

    if (!req.subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    const canceledSubscription = await stripeService.cancelSubscription(
      req.subscription.stripeSubscriptionId,
      immediately
    );

    // Store cancellation feedback
    if (reason || feedback) {
      req.subscription.metadata.cancellationReason = reason;
      req.subscription.metadata.cancellationFeedback = feedback;
      await req.subscription.save();
    }

    res.json({
      success: true,
      message: immediately 
        ? 'Subscription canceled immediately' 
        : 'Subscription will be canceled at the end of the billing period',
      subscription: canceledSubscription
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling subscription',
      error: error.message
    });
  }
});

// Reactivate canceled subscription
router.post('/subscription/reactivate', 
  authMiddleware, 
  tenantMiddleware,
  requireRole('owner', 'admin'),
  validateSubscription,
  async (req, res) => {
  try {
    if (!req.subscription || !req.subscription.cancelAtPeriodEnd) {
      return res.status(400).json({
        success: false,
        message: 'No canceled subscription to reactivate'
      });
    }

    const reactivatedSubscription = await stripeService.reactivateSubscription(
      req.subscription.stripeSubscriptionId
    );

    res.json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: reactivatedSubscription
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating subscription',
      error: error.message
    });
  }
});

// Get billing portal URL
router.post('/portal', 
  authMiddleware, 
  tenantMiddleware,
  requireRole('owner', 'admin'),
  async (req, res) => {
  try {
    const returnUrl = req.body.returnUrl || `${process.env.FRONTEND_URL}/billing`;

    if (!req.organization.customerId) {
      return res.status(400).json({
        success: false,
        message: 'No billing account found. Please subscribe to a plan first.'
      });
    }

    const session = await stripeService.createBillingPortalSession(
      req.organization.customerId,
      returnUrl
    );

    res.json({
      success: true,
      portalUrl: session.url
    });
  } catch (error) {
    console.error('Error creating billing portal session:', error);
    res.status(500).json({
      success: false,
      message: 'Error accessing billing portal',
      error: error.message
    });
  }
});

// Get available plans
router.get('/plans', async (req, res) => {
  try {
    const plans = [
      {
        id: 'starter',
        name: 'Starter',
        monthlyPrice: 19,
        yearlyPrice: 190,
        features: {
          maxUsers: 1,
          maxProjects: 5,
          maxClients: 10,
          storageGB: 1,
          basicReporting: true,
          clientPortal: false,
          whiteLabel: false,
          apiAccess: false,
          advancedReporting: false,
          teamCollaboration: false,
          prioritySupport: false
        },
        description: 'Perfect for individual freelancers just getting started'
      },
      {
        id: 'pro',
        name: 'Pro',
        monthlyPrice: 39,
        yearlyPrice: 390,
        features: {
          maxUsers: 1,
          maxProjects: 'Unlimited',
          maxClients: 'Unlimited',
          storageGB: 10,
          basicReporting: true,
          clientPortal: false,
          whiteLabel: false,
          apiAccess: false,
          advancedReporting: true,
          teamCollaboration: false,
          prioritySupport: false
        },
        description: 'For established freelancers with multiple clients',
        popular: true
      },
      {
        id: 'team',
        name: 'Team',
        monthlyPrice: 79,
        yearlyPrice: 790,
        features: {
          maxUsers: 5,
          maxProjects: 'Unlimited',
          maxClients: 'Unlimited',
          storageGB: 50,
          basicReporting: true,
          clientPortal: true,
          whiteLabel: false,
          apiAccess: true,
          advancedReporting: true,
          teamCollaboration: true,
          prioritySupport: true
        },
        description: 'For small teams and growing agencies'
      },
      {
        id: 'agency',
        name: 'Agency',
        monthlyPrice: 149,
        yearlyPrice: 1490,
        features: {
          maxUsers: 'Unlimited',
          maxProjects: 'Unlimited',
          maxClients: 'Unlimited',
          storageGB: 500,
          basicReporting: true,
          clientPortal: true,
          whiteLabel: true,
          apiAccess: true,
          advancedReporting: true,
          teamCollaboration: true,
          prioritySupport: true,
          sla: true,
          customIntegrations: true
        },
        description: 'Full-featured solution for agencies and enterprises'
      }
    ];

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plans'
    });
  }
});

// Get usage and limits
router.get('/usage', 
  authMiddleware, 
  tenantMiddleware,
  async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      organizationId: req.organizationId 
    });

    const usage = {
      users: {
        current: req.organization.usage.currentUsers,
        limit: req.organization.limits.maxUsers,
        percentage: req.organization.limits.maxUsers === -1 ? 0 :
          (req.organization.usage.currentUsers / req.organization.limits.maxUsers) * 100
      },
      projects: {
        current: req.organization.usage.currentProjects,
        limit: req.organization.limits.maxProjects,
        percentage: req.organization.limits.maxProjects === -1 ? 0 :
          (req.organization.usage.currentProjects / req.organization.limits.maxProjects) * 100
      },
      storage: {
        current: req.organization.usage.currentStorageGB,
        limit: req.organization.limits.maxStorageGB,
        percentage: req.organization.limits.maxStorageGB === -1 ? 0 :
          (req.organization.usage.currentStorageGB / req.organization.limits.maxStorageGB) * 100
      }
    };

    const warnings = subscription ? subscription.checkUsageLimits() : [];

    res.json({
      success: true,
      usage,
      warnings,
      plan: req.organization.plan
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching usage data'
    });
  }
});

// Webhook endpoint for Stripe events
router.post('/webhook', 
  express.raw({ type: 'application/json' }),
  async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    await stripeService.handleWebhook(event);

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({
      success: false,
      message: `Webhook Error: ${error.message}`
    });
  }
});

// Get invoice history
router.get('/invoices', 
  authMiddleware, 
  tenantMiddleware,
  requireRole('owner', 'admin'),
  async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ 
      organizationId: req.organizationId 
    });

    if (!subscription) {
      return res.json({
        success: true,
        invoices: []
      });
    }

    res.json({
      success: true,
      invoices: subscription.billingHistory,
      upcomingInvoice: subscription.upcomingInvoice
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices'
    });
  }
});

module.exports = router;