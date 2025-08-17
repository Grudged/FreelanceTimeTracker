const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');

class StripeService {
  constructor() {
    this.stripe = stripe;
    this.plans = {
      starter: {
        monthly: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || 'price_starter_monthly',
        yearly: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || 'price_starter_yearly',
        price: 19,
        yearlyPrice: 190
      },
      pro: {
        monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
        yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
        price: 39,
        yearlyPrice: 390
      },
      team: {
        monthly: process.env.STRIPE_TEAM_MONTHLY_PRICE_ID || 'price_team_monthly',
        yearly: process.env.STRIPE_TEAM_YEARLY_PRICE_ID || 'price_team_yearly',
        price: 79,
        yearlyPrice: 790
      },
      agency: {
        monthly: process.env.STRIPE_AGENCY_MONTHLY_PRICE_ID || 'price_agency_monthly',
        yearly: process.env.STRIPE_AGENCY_YEARLY_PRICE_ID || 'price_agency_yearly',
        price: 149,
        yearlyPrice: 1490
      }
    };
  }

  async createCustomer(user, organization) {
    try {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim() || user.username,
        metadata: {
          organizationId: organization._id.toString(),
          userId: user._id.toString(),
          organizationName: organization.name
        }
      });

      await Organization.findByIdAndUpdate(organization._id, {
        customerId: customer.id,
        billingEmail: user.email
      });

      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  async createSubscription(organizationId, plan, billingInterval = 'month', paymentMethodId = null) {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      let customerId = organization.customerId;
      if (!customerId) {
        const user = await User.findById(organization.ownerId);
        const customer = await this.createCustomer(user, organization);
        customerId = customer.id;
      }

      if (paymentMethodId) {
        await this.stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId
        });

        await this.stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId
          }
        });
      }

      const priceId = this.plans[plan][billingInterval === 'year' ? 'yearly' : 'monthly'];
      
      const subscriptionData = {
        customer: customerId,
        items: [{ price: priceId }],
        trial_period_days: 14,
        metadata: {
          organizationId: organizationId.toString(),
          plan: plan
        },
        expand: ['latest_invoice.payment_intent']
      };

      if (!paymentMethodId) {
        subscriptionData.payment_behavior = 'default_incomplete';
        subscriptionData.payment_settings = {
          save_default_payment_method: 'on_subscription'
        };
      }

      const stripeSubscription = await this.stripe.subscriptions.create(subscriptionData);

      const subscription = await Subscription.create({
        organizationId: organizationId,
        stripeCustomerId: customerId,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: priceId,
        stripeProductId: stripeSubscription.items.data[0].price.product,
        plan: plan,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
        billingInterval: billingInterval,
        amount: this.plans[plan][billingInterval === 'year' ? 'yearlyPrice' : 'price'],
        currency: 'usd',
        features: this.getPlanFeatures(plan)
      });

      await Organization.findByIdAndUpdate(organizationId, {
        subscriptionId: stripeSubscription.id,
        plan: plan,
        subscriptionStatus: stripeSubscription.status,
        trialEndDate: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null
      });

      return {
        subscription,
        stripeSubscription,
        clientSecret: stripeSubscription.latest_invoice?.payment_intent?.client_secret
      };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId, newPlan, billingInterval = null) {
    try {
      const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const stripeSubscription = await this.stripe.subscriptions.retrieve(subscriptionId);
      
      const newBillingInterval = billingInterval || subscription.billingInterval;
      const newPriceId = this.plans[newPlan][newBillingInterval === 'year' ? 'yearly' : 'monthly'];

      const updatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: stripeSubscription.items.data[0].id,
          price: newPriceId
        }],
        proration_behavior: 'create_prorations',
        metadata: {
          plan: newPlan,
          previousPlan: subscription.plan
        }
      });

      subscription.plan = newPlan;
      subscription.stripePriceId = newPriceId;
      subscription.billingInterval = newBillingInterval;
      subscription.amount = this.plans[newPlan][newBillingInterval === 'year' ? 'yearlyPrice' : 'price'];
      subscription.features = this.getPlanFeatures(newPlan);
      
      subscription.planHistory.push({
        plan: newPlan,
        startDate: new Date(),
        reason: 'manual_upgrade'
      });

      await subscription.save();

      await Organization.findById(subscription.organizationId).then(org => {
        if (org) {
          return org.updatePlanLimits(newPlan);
        }
      });

      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId, immediately = false) {
    try {
      const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const canceledSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: !immediately
      });

      if (immediately) {
        await this.stripe.subscriptions.cancel(subscriptionId);
        subscription.status = 'canceled';
        subscription.canceledAt = new Date();
      } else {
        subscription.cancelAtPeriodEnd = true;
      }

      await subscription.save();

      await Organization.findByIdAndUpdate(subscription.organizationId, {
        subscriptionStatus: canceledSubscription.status
      });

      return canceledSubscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  async reactivateSubscription(subscriptionId) {
    try {
      const subscription = await Subscription.findOne({ stripeSubscriptionId: subscriptionId });
      if (!subscription) {
        throw new Error('Subscription not found');
      }

      const reactivatedSubscription = await this.stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false
      });

      subscription.cancelAtPeriodEnd = false;
      subscription.status = reactivatedSubscription.status;
      await subscription.save();

      await Organization.findByIdAndUpdate(subscription.organizationId, {
        subscriptionStatus: reactivatedSubscription.status
      });

      return reactivatedSubscription;
    } catch (error) {
      console.error('Error reactivating subscription:', error);
      throw error;
    }
  }

  async createBillingPortalSession(customerId, returnUrl) {
    try {
      const session = await this.stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl
      });

      return session;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  async createCheckoutSession(organizationId, plan, billingInterval, successUrl, cancelUrl) {
    try {
      const organization = await Organization.findById(organizationId);
      if (!organization) {
        throw new Error('Organization not found');
      }

      let customerId = organization.customerId;
      if (!customerId) {
        const user = await User.findById(organization.ownerId);
        const customer = await this.createCustomer(user, organization);
        customerId = customer.id;
      }

      const priceId = this.plans[plan][billingInterval === 'year' ? 'yearly' : 'monthly'];

      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [{
          price: priceId,
          quantity: 1
        }],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: {
          trial_period_days: 14,
          metadata: {
            organizationId: organizationId.toString(),
            plan: plan
          }
        },
        metadata: {
          organizationId: organizationId.toString(),
          plan: plan
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  async handleWebhook(event) {
    try {
      const webhookHandlers = {
        'customer.subscription.created': this.handleSubscriptionCreated.bind(this),
        'customer.subscription.updated': this.handleSubscriptionUpdated.bind(this),
        'customer.subscription.deleted': this.handleSubscriptionDeleted.bind(this),
        'invoice.payment_succeeded': this.handlePaymentSucceeded.bind(this),
        'invoice.payment_failed': this.handlePaymentFailed.bind(this),
        'customer.subscription.trial_will_end': this.handleTrialWillEnd.bind(this)
      };

      const handler = webhookHandlers[event.type];
      if (handler) {
        await handler(event);
      }

      return { received: true };
    } catch (error) {
      console.error('Webhook handler error:', error);
      throw error;
    }
  }

  async handleSubscriptionCreated(event) {
    const stripeSubscription = event.data.object;
    const organizationId = stripeSubscription.metadata.organizationId;
    const plan = stripeSubscription.metadata.plan;

    const existingSubscription = await Subscription.findOne({ 
      stripeSubscriptionId: stripeSubscription.id 
    });

    if (!existingSubscription) {
      await Subscription.create({
        organizationId: organizationId,
        stripeCustomerId: stripeSubscription.customer,
        stripeSubscriptionId: stripeSubscription.id,
        stripePriceId: stripeSubscription.items.data[0].price.id,
        stripeProductId: stripeSubscription.items.data[0].price.product,
        plan: plan,
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        trialStart: stripeSubscription.trial_start ? new Date(stripeSubscription.trial_start * 1000) : null,
        trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null,
        features: this.getPlanFeatures(plan)
      });
    }

    await Organization.findByIdAndUpdate(organizationId, {
      subscriptionId: stripeSubscription.id,
      subscriptionStatus: stripeSubscription.status,
      plan: plan
    });
  }

  async handleSubscriptionUpdated(event) {
    const stripeSubscription = event.data.object;
    
    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: stripeSubscription.id },
      {
        status: stripeSubscription.status,
        currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
        currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        canceledAt: stripeSubscription.canceled_at ? new Date(stripeSubscription.canceled_at * 1000) : null
      }
    );

    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: stripeSubscription.id 
    });

    if (subscription) {
      await Organization.findByIdAndUpdate(subscription.organizationId, {
        subscriptionStatus: stripeSubscription.status
      });
    }
  }

  async handleSubscriptionDeleted(event) {
    const stripeSubscription = event.data.object;
    
    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: stripeSubscription.id 
    });

    if (subscription) {
      subscription.status = 'canceled';
      subscription.canceledAt = new Date();
      await subscription.save();

      await Organization.findByIdAndUpdate(subscription.organizationId, {
        subscriptionStatus: 'canceled',
        isTrialActive: false
      });
    }
  }

  async handlePaymentSucceeded(event) {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscriptionId },
      {
        'latestInvoice.id': invoice.id,
        'latestInvoice.number': invoice.number,
        'latestInvoice.amountPaid': invoice.amount_paid / 100,
        'latestInvoice.status': invoice.status,
        'latestInvoice.hostedInvoiceUrl': invoice.hosted_invoice_url,
        'latestInvoice.pdfUrl': invoice.invoice_pdf,
        'latestInvoice.createdAt': new Date(invoice.created * 1000),
        $push: {
          billingHistory: {
            invoiceId: invoice.id,
            date: new Date(invoice.created * 1000),
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: 'paid',
            description: `Payment for ${invoice.lines.data[0].description}`,
            pdfUrl: invoice.invoice_pdf,
            hostedUrl: invoice.hosted_invoice_url
          }
        }
      }
    );
  }

  async handlePaymentFailed(event) {
    const invoice = event.data.object;
    const subscriptionId = invoice.subscription;

    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: subscriptionId 
    });

    if (subscription) {
      subscription.notifications.paymentFailed.sent = true;
      subscription.notifications.paymentFailed.sentAt = new Date();
      subscription.notifications.paymentFailed.attempts += 1;
      await subscription.save();

      // TODO: Send email notification to customer
    }
  }

  async handleTrialWillEnd(event) {
    const stripeSubscription = event.data.object;
    
    const subscription = await Subscription.findOne({ 
      stripeSubscriptionId: stripeSubscription.id 
    });

    if (subscription) {
      subscription.notifications.trialEnding.sent = true;
      subscription.notifications.trialEnding.sentAt = new Date();
      await subscription.save();

      // TODO: Send email notification to customer
    }
  }

  getPlanFeatures(plan) {
    const features = {
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

    return features[plan] || features.starter;
  }

  async getSubscriptionMetrics(organizationId) {
    try {
      const subscription = await Subscription.findOne({ organizationId });
      if (!subscription) {
        return null;
      }

      const organization = await Organization.findById(organizationId);
      
      return {
        plan: subscription.plan,
        status: subscription.status,
        mrr: subscription.mrr,
        arr: subscription.arr,
        daysUntilRenewal: subscription.daysUntilRenewal(),
        daysLeftInTrial: subscription.daysLeftInTrial(),
        usage: {
          users: {
            current: organization.usage.currentUsers,
            limit: subscription.features.maxUsers,
            percentage: subscription.features.maxUsers === -1 ? 0 : 
              (organization.usage.currentUsers / subscription.features.maxUsers) * 100
          },
          projects: {
            current: organization.usage.currentProjects,
            limit: subscription.features.maxProjects,
            percentage: subscription.features.maxProjects === -1 ? 0 :
              (organization.usage.currentProjects / subscription.features.maxProjects) * 100
          },
          storage: {
            current: organization.usage.currentStorageGB,
            limit: subscription.features.maxStorageGB,
            percentage: subscription.features.maxStorageGB === -1 ? 0 :
              (organization.usage.currentStorageGB / subscription.features.maxStorageGB) * 100
          }
        },
        warnings: subscription.checkUsageLimits()
      };
    } catch (error) {
      console.error('Error getting subscription metrics:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();