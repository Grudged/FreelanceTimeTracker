import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  invoiceDate: Date;
  dueDate: Date;
  paidDate?: Date;
  description: string;
  downloadUrl?: string;
  stripeInvoiceId?: string;
}

interface PaymentMethod {
  _id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

interface UsageMetrics {
  period: string;
  projectsCreated: number;
  timeEntriesLogged: number;
  reportsGenerated: number;
  teamMembersActive: number;
  storageUsed: number; // in MB
  apiCalls: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  currentUser: any = null;
  organization: any = null;
  isLoading = true;
  isOwner = false;

  // Data
  invoices: Invoice[] = [];
  paymentMethods: PaymentMethod[] = [];
  usageMetrics: UsageMetrics | null = null;
  
  // Current subscription details
  subscription = {
    plan: 'professional',
    status: 'active',
    currentPeriodStart: new Date('2024-08-01'),
    currentPeriodEnd: new Date('2024-09-01'),
    nextBillingAmount: 49,
    currency: 'USD'
  };

  // Modals
  showAddPaymentModal = false;
  showChangePlanModal = false;
  showUsageModal = false;

  // Forms
  addPaymentForm = {
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: '',
    makeDefault: false
  };

  // Plan options
  planOptions = [
    {
      id: 'starter',
      name: 'Starter',
      price: 19,
      features: ['Up to 5 users', 'Basic time tracking', 'Project management', 'Monthly reports'],
      recommended: false
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 49,
      features: ['Up to 25 users', 'Advanced analytics', 'Team collaboration', 'Custom integrations', 'Priority support'],
      recommended: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149,
      features: ['Up to 100 users', 'Custom workflows', 'Advanced security', 'Dedicated support', 'SLA guarantee'],
      recommended: false
    }
  ];

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadBillingData();
      }
    });
  }

  loadBillingData(): void {
    // TODO: Replace with actual API calls
    setTimeout(() => {
      this.loadInvoices();
      this.loadPaymentMethods();
      this.loadUsageMetrics();
      this.checkUserPermissions();
      this.isLoading = false;
    }, 1000);
  }

  loadInvoices(): void {
    // Mock invoice data
    this.invoices = [
      {
        _id: '1',
        invoiceNumber: 'INV-2024-008',
        amount: 49.00,
        currency: 'USD',
        status: 'paid',
        invoiceDate: new Date('2024-08-01'),
        dueDate: new Date('2024-08-01'),
        paidDate: new Date('2024-08-01'),
        description: 'FreelanceTimeTracker Professional - August 2024',
        downloadUrl: '/api/invoices/1/download',
        stripeInvoiceId: 'in_1234567890'
      },
      {
        _id: '2',
        invoiceNumber: 'INV-2024-007',
        amount: 49.00,
        currency: 'USD',
        status: 'paid',
        invoiceDate: new Date('2024-07-01'),
        dueDate: new Date('2024-07-01'),
        paidDate: new Date('2024-07-01'),
        description: 'FreelanceTimeTracker Professional - July 2024',
        downloadUrl: '/api/invoices/2/download',
        stripeInvoiceId: 'in_0987654321'
      },
      {
        _id: '3',
        invoiceNumber: 'INV-2024-006',
        amount: 19.00,
        currency: 'USD',
        status: 'paid',
        invoiceDate: new Date('2024-06-01'),
        dueDate: new Date('2024-06-01'),
        paidDate: new Date('2024-06-01'),
        description: 'FreelanceTimeTracker Starter - June 2024',
        downloadUrl: '/api/invoices/3/download',
        stripeInvoiceId: 'in_1122334455'
      }
    ];
  }

  loadPaymentMethods(): void {
    // Mock payment method data
    this.paymentMethods = [
      {
        _id: '1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        expiryMonth: 12,
        expiryYear: 2027,
        isDefault: true,
        stripePaymentMethodId: 'pm_1234567890'
      },
      {
        _id: '2',
        type: 'card',
        last4: '0005',
        brand: 'mastercard',
        expiryMonth: 8,
        expiryYear: 2026,
        isDefault: false,
        stripePaymentMethodId: 'pm_0987654321'
      }
    ];
  }

  loadUsageMetrics(): void {
    // Mock usage data
    this.usageMetrics = {
      period: 'August 2024',
      projectsCreated: 12,
      timeEntriesLogged: 1847,
      reportsGenerated: 23,
      teamMembersActive: 8,
      storageUsed: 127.5,
      apiCalls: 15420
    };
  }

  checkUserPermissions(): void {
    // TODO: Check actual user role from organization
    this.isOwner = true; // Mock - should be determined from organization data
  }

  // Invoice Actions
  downloadInvoice(invoice: Invoice): void {
    if (invoice.downloadUrl) {
      // TODO: Implement actual download
      window.open(invoice.downloadUrl, '_blank');
      this.toastService.success('Download Started', `Invoice ${invoice.invoiceNumber} is being downloaded`);
    }
  }

  getInvoiceStatusClass(status: string): string {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'failed': return 'status-failed';
      case 'refunded': return 'status-refunded';
      default: return 'status-unknown';
    }
  }

  // Payment Method Actions
  openAddPaymentModal(): void {
    this.addPaymentForm = {
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      name: '',
      makeDefault: false
    };
    this.showAddPaymentModal = true;
  }

  addPaymentMethod(): void {
    if (!this.validatePaymentForm()) {
      return;
    }

    // TODO: Implement Stripe payment method creation
    const newPaymentMethod: PaymentMethod = {
      _id: Date.now().toString(),
      type: 'card',
      last4: this.addPaymentForm.cardNumber.slice(-4),
      brand: this.getCardBrand(this.addPaymentForm.cardNumber),
      expiryMonth: parseInt(this.addPaymentForm.expiryMonth),
      expiryYear: parseInt(this.addPaymentForm.expiryYear),
      isDefault: this.addPaymentForm.makeDefault,
      stripePaymentMethodId: 'pm_mock_' + Date.now()
    };

    if (this.addPaymentForm.makeDefault) {
      this.paymentMethods.forEach(pm => pm.isDefault = false);
    }

    this.paymentMethods.push(newPaymentMethod);
    this.showAddPaymentModal = false;
    this.toastService.success('Success', 'Payment method added successfully');
  }

  validatePaymentForm(): boolean {
    const form = this.addPaymentForm;
    
    if (!form.cardNumber || form.cardNumber.length < 13) {
      this.toastService.error('Error', 'Please enter a valid card number');
      return false;
    }
    
    if (!form.expiryMonth || !form.expiryYear) {
      this.toastService.error('Error', 'Please enter expiry date');
      return false;
    }
    
    if (!form.cvc || form.cvc.length < 3) {
      this.toastService.error('Error', 'Please enter a valid CVC');
      return false;
    }
    
    if (!form.name.trim()) {
      this.toastService.error('Error', 'Please enter the cardholder name');
      return false;
    }
    
    return true;
  }

  getCardBrand(cardNumber: string): string {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (/^5[1-5]/.test(number) || /^2[2-7]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    if (/^6/.test(number)) return 'discover';
    return 'unknown';
  }

  setDefaultPaymentMethod(paymentMethod: PaymentMethod): void {
    if (!this.isOwner) {
      this.toastService.error('Error', 'Only organization owners can change payment methods');
      return;
    }

    // TODO: Update via API
    this.paymentMethods.forEach(pm => pm.isDefault = false);
    paymentMethod.isDefault = true;
    this.toastService.success('Success', 'Default payment method updated');
  }

  removePaymentMethod(paymentMethod: PaymentMethod): void {
    if (!this.isOwner) {
      this.toastService.error('Error', 'Only organization owners can remove payment methods');
      return;
    }

    if (paymentMethod.isDefault && this.paymentMethods.length > 1) {
      this.toastService.error('Error', 'Cannot remove the default payment method. Please set another as default first.');
      return;
    }

    if (confirm('Are you sure you want to remove this payment method?')) {
      // TODO: Remove via API
      this.paymentMethods = this.paymentMethods.filter(pm => pm._id !== paymentMethod._id);
      this.toastService.success('Success', 'Payment method removed');
    }
  }

  // Plan Management
  openChangePlanModal(): void {
    this.showChangePlanModal = true;
  }

  changePlan(planId: string): void {
    if (!this.isOwner) {
      this.toastService.error('Error', 'Only organization owners can change subscription plans');
      return;
    }

    const plan = this.planOptions.find(p => p.id === planId);
    if (!plan) return;

    // TODO: Implement plan change via Stripe
    this.subscription.plan = planId;
    this.subscription.nextBillingAmount = plan.price;
    this.showChangePlanModal = false;
    this.toastService.success('Success', `Plan changed to ${plan.name}. Changes will take effect on your next billing cycle.`);
  }

  // Usage Modal
  openUsageModal(): void {
    this.showUsageModal = true;
  }

  // Utility Methods
  formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  closeModal(): void {
    this.showAddPaymentModal = false;
    this.showChangePlanModal = false;
    this.showUsageModal = false;
  }
}