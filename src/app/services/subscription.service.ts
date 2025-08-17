import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  maxUsers: number;
  features: string[];
  stripePriceId: string;
  isActive: boolean;
  recommended?: boolean;
  popular?: boolean;
}

export interface PlanComparison {
  starter: PricingPlan;
  professional: PricingPlan;
  enterprise: PricingPlan;
  custom?: PricingPlan;
}

export interface SubscriptionStatus {
  isActive: boolean;
  plan: PricingPlan;
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'unpaid';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  daysUntilBilling: number;
  usageWithinLimits: {
    users: { current: number; limit: number; percentage: number };
    projects: { current: number; limit: number; percentage: number };
    storage: { current: number; limit: number; percentage: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = environment?.apiUrl || 'http://localhost:3000/api';
  private currentSubscriptionSubject = new BehaviorSubject<SubscriptionStatus | null>(null);
  public currentSubscription$ = this.currentSubscriptionSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Plan Information
  getAvailablePlans(): Observable<{ plans: PricingPlan[] }> {
    return this.http.get<{ plans: PricingPlan[] }>(`${this.apiUrl}/subscription/plans`);
  }

  getPlanComparison(): Observable<{ comparison: PlanComparison }> {
    return this.http.get<{ comparison: PlanComparison }>(`${this.apiUrl}/subscription/plans/comparison`);
  }

  getPlanById(planId: string): Observable<{ plan: PricingPlan }> {
    return this.http.get<{ plan: PricingPlan }>(`${this.apiUrl}/subscription/plans/${planId}`);
  }

  // Current Subscription Status
  getSubscriptionStatus(): Observable<{ subscription: SubscriptionStatus }> {
    return this.http.get<{ subscription: SubscriptionStatus }>(`${this.apiUrl}/subscription/status`);
  }

  refreshSubscriptionStatus(): Observable<{ subscription: SubscriptionStatus }> {
    return this.http.post<{ subscription: SubscriptionStatus }>(`${this.apiUrl}/subscription/refresh`, {});
  }

  // Plan Changes
  upgradePlan(data: {
    newPlanId: string;
    paymentMethodId?: string;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  }): Observable<{
    subscription: SubscriptionStatus;
    requiresPayment: boolean;
    clientSecret?: string;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/upgrade`, data);
  }

  downgradePlan(data: {
    newPlanId: string;
    effectiveDate?: 'immediate' | 'next_billing_cycle';
    reason?: string;
  }): Observable<{
    subscription: SubscriptionStatus;
    effectiveDate: Date;
    creditAmount?: number;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/downgrade`, data);
  }

  // Trial Management
  startFreeTrial(planId: string): Observable<{
    subscription: SubscriptionStatus;
    trialEnd: Date;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/trial`, { planId });
  }

  extendTrial(days: number, reason: string): Observable<{
    subscription: SubscriptionStatus;
    newTrialEnd: Date;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/trial/extend`, { days, reason });
  }

  convertTrialToSubscription(data: {
    paymentMethodId: string;
    planId?: string;
  }): Observable<{
    subscription: SubscriptionStatus;
    firstChargeDate: Date;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/trial/convert`, data);
  }

  // Subscription Lifecycle
  pauseSubscription(data: {
    reason: string;
    resumeDate?: Date;
  }): Observable<{
    subscription: SubscriptionStatus;
    pausedUntil?: Date;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/pause`, data);
  }

  resumeSubscription(): Observable<{
    subscription: SubscriptionStatus;
    nextBillingDate: Date;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/resume`, {});
  }

  cancelSubscription(data: {
    reason: string;
    feedback?: string;
    cancelAtPeriodEnd: boolean;
    immediateAccess?: boolean;
  }): Observable<{
    subscription: SubscriptionStatus;
    accessUntil: Date;
    refundAmount?: number;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/cancel`, data);
  }

  reactivateSubscription(data: {
    planId?: string;
    paymentMethodId?: string;
  }): Observable<{
    subscription: SubscriptionStatus;
    nextBillingDate: Date;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/reactivate`, data);
  }

  // Usage and Limits
  checkUsageLimits(): Observable<{
    withinLimits: boolean;
    usage: {
      users: { current: number; limit: number; percentage: number };
      projects: { current: number; limit: number; percentage: number };
      storage: { current: number; limit: number; percentage: number };
      apiCalls: { current: number; limit: number; percentage: number };
    };
    warnings: string[];
    blockers: string[];
  }> {
    return this.http.get<any>(`${this.apiUrl}/subscription/usage-limits`);
  }

  requestLimitIncrease(data: {
    limitType: 'users' | 'projects' | 'storage' | 'api_calls';
    requestedAmount: number;
    businessJustification: string;
    urgency: 'low' | 'medium' | 'high';
  }): Observable<{
    requestId: string;
    status: 'pending' | 'approved' | 'denied';
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/request-limit-increase`, data);
  }

  // Pricing Calculations
  calculateUpgradePreview(newPlanId: string): Observable<{
    prorationAmount: number;
    nextBillingAmount: number;
    nextBillingDate: Date;
    savingsPercentage?: number;
    additionalFeatures: string[];
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/upgrade-preview`, { newPlanId });
  }

  calculateDowngradeImpact(newPlanId: string): Observable<{
    creditAmount: number;
    lostFeatures: string[];
    dataRetentionPeriod: number;
    usageLimitImpact: {
      willExceedLimits: boolean;
      affected: string[];
      actions_required: string[];
    };
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/downgrade-preview`, { newPlanId });
  }

  // Customer Portal Integration
  createCustomerPortalSession(returnUrl?: string): Observable<{ portalUrl: string }> {
    return this.http.post<{ portalUrl: string }>(`${this.apiUrl}/subscription/portal`, {
      returnUrl: returnUrl || window.location.origin + '/billing'
    });
  }

  // Subscription Events and History
  getSubscriptionHistory(): Observable<{
    events: Array<{
      id: string;
      type: 'created' | 'upgraded' | 'downgraded' | 'canceled' | 'reactivated' | 'trial_started' | 'trial_ended';
      timestamp: Date;
      description: string;
      planBefore?: string;
      planAfter?: string;
      amount?: number;
    }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/subscription/history`);
  }

  // Notifications and Alerts
  getSubscriptionAlerts(): Observable<{
    alerts: Array<{
      id: string;
      type: 'trial_ending' | 'payment_failed' | 'usage_limit_warning' | 'plan_change_pending';
      severity: 'info' | 'warning' | 'error';
      message: string;
      actionRequired: boolean;
      actionUrl?: string;
      expiresAt?: Date;
    }>;
  }> {
    return this.http.get<any>(`${this.apiUrl}/subscription/alerts`);
  }

  dismissAlert(alertId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/subscription/alerts/${alertId}`);
  }

  // Enterprise Features
  requestCustomPlan(data: {
    estimatedUsers: number;
    requiredFeatures: string[];
    budget: string;
    timeline: string;
    contactInfo: {
      name: string;
      email: string;
      phone?: string;
      company: string;
      role: string;
    };
    additionalRequirements: string;
  }): Observable<{
    requestId: string;
    estimatedResponse: Date;
    message: string;
  }> {
    return this.http.post<any>(`${this.apiUrl}/subscription/request-custom-plan`, data);
  }

  // Utility Methods
  setCurrentSubscription(subscription: SubscriptionStatus): void {
    this.currentSubscriptionSubject.next(subscription);
  }

  getCurrentSubscription(): SubscriptionStatus | null {
    return this.currentSubscriptionSubject.value;
  }

  isOnTrial(): boolean {
    const subscription = this.getCurrentSubscription();
    return subscription?.status === 'trialing' || false;
  }

  isActive(): boolean {
    const subscription = this.getCurrentSubscription();
    return subscription?.isActive || false;
  }

  canUpgrade(currentPlanId: string, targetPlanId: string): boolean {
    const planHierarchy = ['starter', 'professional', 'enterprise', 'custom'];
    const currentIndex = planHierarchy.indexOf(currentPlanId);
    const targetIndex = planHierarchy.indexOf(targetPlanId);
    return targetIndex > currentIndex;
  }

  canDowngrade(currentPlanId: string, targetPlanId: string): boolean {
    const planHierarchy = ['starter', 'professional', 'enterprise', 'custom'];
    const currentIndex = planHierarchy.indexOf(currentPlanId);
    const targetIndex = planHierarchy.indexOf(targetPlanId);
    return targetIndex < currentIndex;
  }

  getDaysUntilBilling(): number {
    const subscription = this.getCurrentSubscription();
    if (!subscription) return 0;
    
    const now = new Date();
    const billingDate = new Date(subscription.currentPeriodEnd);
    const diffTime = billingDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
}