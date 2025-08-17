import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded' | 'draft';
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;
  description: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
  }[];
  downloadUrl?: string;
  stripeInvoiceId?: string;
  organizationId: string;
}

export interface PaymentMethod {
  _id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
  createdAt: Date;
}

export interface UsageMetrics {
  period: string;
  startDate: Date;
  endDate: Date;
  projectsCreated: number;
  timeEntriesLogged: number;
  reportsGenerated: number;
  teamMembersActive: number;
  storageUsed: number; // in bytes
  apiCalls: number;
  billingPeriod: 'current' | 'previous';
}

export interface SubscriptionDetails {
  id: string;
  status: 'active' | 'past_due' | 'canceled' | 'unpaid' | 'trialing';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  canceledAt?: Date;
  trialEnd?: Date;
  plan: {
    id: string;
    name: string;
    amount: number;
    currency: string;
    interval: 'month' | 'year';
  };
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private apiUrl = environment?.apiUrl || 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Invoice Management
  getInvoices(page: number = 1, limit: number = 20): Observable<{ 
    invoices: Invoice[], 
    pagination: { 
      total: number, 
      page: number, 
      pages: number, 
      limit: number 
    } 
  }> {
    return this.http.get<any>(`${this.apiUrl}/billing/invoices?page=${page}&limit=${limit}`);
  }

  getInvoice(invoiceId: string): Observable<{ invoice: Invoice }> {
    return this.http.get<{ invoice: Invoice }>(`${this.apiUrl}/billing/invoices/${invoiceId}`);
  }

  downloadInvoice(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/billing/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
  }

  // Payment Method Management
  getPaymentMethods(): Observable<{ paymentMethods: PaymentMethod[] }> {
    return this.http.get<{ paymentMethods: PaymentMethod[] }>(`${this.apiUrl}/billing/payment-methods`);
  }

  addPaymentMethod(paymentMethodData: {
    stripePaymentMethodId: string;
    makeDefault?: boolean;
  }): Observable<{ paymentMethod: PaymentMethod; message: string }> {
    return this.http.post<{ paymentMethod: PaymentMethod; message: string }>(
      `${this.apiUrl}/billing/payment-methods`, 
      paymentMethodData
    );
  }

  setDefaultPaymentMethod(paymentMethodId: string): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(
      `${this.apiUrl}/billing/payment-methods/${paymentMethodId}/default`, 
      {}
    );
  }

  removePaymentMethod(paymentMethodId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/billing/payment-methods/${paymentMethodId}`);
  }

  // Subscription Management
  getSubscription(): Observable<{ subscription: SubscriptionDetails }> {
    return this.http.get<{ subscription: SubscriptionDetails }>(`${this.apiUrl}/billing/subscription`);
  }

  createSubscription(data: {
    priceId: string;
    paymentMethodId?: string;
  }): Observable<{ 
    subscription: SubscriptionDetails; 
    clientSecret?: string; 
    requiresAction?: boolean;
  }> {
    return this.http.post<any>(`${this.apiUrl}/billing/subscription`, data);
  }

  updateSubscription(data: {
    priceId: string;
    prorationBehavior?: 'create_prorations' | 'none' | 'always_invoice';
  }): Observable<{ subscription: SubscriptionDetails; message: string }> {
    return this.http.put<any>(`${this.apiUrl}/billing/subscription`, data);
  }

  cancelSubscription(data: {
    cancelAtPeriodEnd: boolean;
    reason?: string;
  }): Observable<{ subscription: SubscriptionDetails; message: string }> {
    return this.http.delete<any>(`${this.apiUrl}/billing/subscription`, {
      body: data
    });
  }

  reactivateSubscription(): Observable<{ subscription: SubscriptionDetails; message: string }> {
    return this.http.post<any>(`${this.apiUrl}/billing/subscription/reactivate`, {});
  }

  // Usage Metrics
  getUsageMetrics(period?: 'current' | 'previous'): Observable<{ usage: UsageMetrics }> {
    const params = period ? `?period=${period}` : '';
    return this.http.get<{ usage: UsageMetrics }>(`${this.apiUrl}/billing/usage${params}`);
  }

  getDetailedUsage(startDate: Date, endDate: Date): Observable<{
    usage: {
      daily: Array<{
        date: Date;
        projectsCreated: number;
        timeEntriesLogged: number;
        apiCalls: number;
        activeUsers: number;
      }>;
      summary: UsageMetrics;
    }
  }> {
    return this.http.get<any>(`${this.apiUrl}/billing/usage/detailed`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
  }

  // Billing Portal
  createPortalSession(returnUrl?: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${this.apiUrl}/billing/portal`, {
      returnUrl: returnUrl || window.location.origin + '/billing'
    });
  }

  // Stripe Checkout
  createCheckoutSession(data: {
    priceId: string;
    mode: 'subscription' | 'payment';
    successUrl?: string;
    cancelUrl?: string;
    customerId?: string;
  }): Observable<{ sessionId: string; url: string }> {
    return this.http.post<{ sessionId: string; url: string }>(`${this.apiUrl}/billing/checkout`, {
      ...data,
      successUrl: data.successUrl || window.location.origin + '/billing?success=true',
      cancelUrl: data.cancelUrl || window.location.origin + '/billing?canceled=true'
    });
  }

  // Webhook handling (for internal use)
  handleWebhook(eventType: string, data: any): Observable<{ received: boolean }> {
    return this.http.post<{ received: boolean }>(`${this.apiUrl}/billing/webhook`, {
      type: eventType,
      data
    });
  }

  // Tax and Compliance
  updateBillingAddress(address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/billing/address`, address);
  }

  updateTaxId(taxId: {
    type: 'us_ein' | 'eu_vat' | 'gb_vat' | 'ca_bn' | 'au_abn';
    value: string;
  }): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/billing/tax-id`, taxId);
  }

  // Payment History and Analytics
  getPaymentHistory(startDate?: Date, endDate?: Date): Observable<{
    payments: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      paymentDate: Date;
      description: string;
      invoiceId?: string;
    }>;
    summary: {
      totalPaid: number;
      totalRefunded: number;
      totalFailed: number;
    };
  }> {
    const params: any = {};
    if (startDate) params.startDate = startDate.toISOString();
    if (endDate) params.endDate = endDate.toISOString();
    
    return this.http.get<any>(`${this.apiUrl}/billing/payments`, { params });
  }

  // Utility Methods
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100); // Stripe amounts are in cents
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  isSubscriptionActive(status: string): boolean {
    return ['active', 'trialing'].includes(status);
  }

  isSubscriptionPastDue(status: string): boolean {
    return status === 'past_due';
  }

  isSubscriptionCanceled(status: string): boolean {
    return ['canceled', 'unpaid'].includes(status);
  }
}