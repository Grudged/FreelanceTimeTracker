import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'month' | 'year';
  maxUsers: number;
  features: string[];
  limitations?: string[];
  recommended: boolean;
  popular: boolean;
  buttonText: string;
  stripePriceId?: string;
  customPrice?: string;
}

interface Feature {
  category: string;
  features: {
    name: string;
    starter: boolean | string;
    professional: boolean | string;
    enterprise: boolean | string;
    custom: boolean | string;
  }[];
}

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrl: './pricing.component.css'
})
export class PricingComponent implements OnInit {
  currentUser: any = null;
  isLoggedIn = false;
  billingCycle: 'monthly' | 'yearly' = 'monthly';
  
  // Pricing plans
  monthlyPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for solo freelancers and small teams getting started',
      price: 19,
      billingPeriod: 'month',
      maxUsers: 5,
      features: [
        'Up to 5 team members',
        'Unlimited projects',
        'Basic time tracking',
        'Project management',
        'Monthly reports',
        'Email support',
        '1GB storage'
      ],
      limitations: [
        'Limited integrations',
        'Basic analytics only'
      ],
      recommended: false,
      popular: false,
      buttonText: 'Start Free Trial',
      stripePriceId: 'price_starter_monthly'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing teams and established freelancers',
      price: 49,
      billingPeriod: 'month',
      maxUsers: 25,
      features: [
        'Up to 25 team members',
        'Everything in Starter',
        'Advanced time tracking',
        'Team collaboration tools',
        'Advanced analytics & insights',
        'Custom integrations',
        'Priority email support',
        'Automated invoicing',
        '10GB storage',
        'Custom branding'
      ],
      recommended: true,
      popular: true,
      buttonText: 'Start Free Trial',
      stripePriceId: 'price_professional_monthly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with advanced requirements',
      price: 149,
      billingPeriod: 'month',
      maxUsers: 100,
      features: [
        'Up to 100 team members',
        'Everything in Professional',
        'Advanced security features',
        'Custom workflows',
        'Dedicated account manager',
        '24/7 phone support',
        'Advanced reporting',
        'SSO integration',
        'Unlimited storage',
        'API access',
        'Custom integrations',
        'SLA guarantee'
      ],
      recommended: false,
      popular: false,
      buttonText: 'Start Free Trial',
      stripePriceId: 'price_enterprise_monthly'
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Tailored solutions for unique business requirements',
      price: 0,
      customPrice: 'Custom Pricing',
      billingPeriod: 'month',
      maxUsers: 999,
      features: [
        'Unlimited team members',
        'Everything in Enterprise',
        'Custom development',
        'Dedicated infrastructure',
        'White-label solution',
        'Custom integrations',
        'Training & onboarding',
        'Dedicated support team',
        'Custom SLA',
        'On-premise deployment'
      ],
      recommended: false,
      popular: false,
      buttonText: 'Contact Sales',
      stripePriceId: undefined
    }
  ];

  yearlyPlans: PricingPlan[] = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for solo freelancers and small teams getting started',
      price: 15, // 20% discount
      billingPeriod: 'year',
      maxUsers: 5,
      features: [
        'Up to 5 team members',
        'Unlimited projects',
        'Basic time tracking',
        'Project management',
        'Monthly reports',
        'Email support',
        '1GB storage'
      ],
      limitations: [
        'Limited integrations',
        'Basic analytics only'
      ],
      recommended: false,
      popular: false,
      buttonText: 'Start Free Trial',
      stripePriceId: 'price_starter_yearly'
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing teams and established freelancers',
      price: 39, // 20% discount
      billingPeriod: 'year',
      maxUsers: 25,
      features: [
        'Up to 25 team members',
        'Everything in Starter',
        'Advanced time tracking',
        'Team collaboration tools',
        'Advanced analytics & insights',
        'Custom integrations',
        'Priority email support',
        'Automated invoicing',
        '10GB storage',
        'Custom branding'
      ],
      recommended: true,
      popular: true,
      buttonText: 'Start Free Trial',
      stripePriceId: 'price_professional_yearly'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with advanced requirements',
      price: 119, // 20% discount
      billingPeriod: 'year',
      maxUsers: 100,
      features: [
        'Up to 100 team members',
        'Everything in Professional',
        'Advanced security features',
        'Custom workflows',
        'Dedicated account manager',
        '24/7 phone support',
        'Advanced reporting',
        'SSO integration',
        'Unlimited storage',
        'API access',
        'Custom integrations',
        'SLA guarantee'
      ],
      recommended: false,
      popular: false,
      buttonText: 'Start Free Trial',
      stripePriceId: 'price_enterprise_yearly'
    },
    {
      id: 'custom',
      name: 'Custom',
      description: 'Tailored solutions for unique business requirements',
      price: 0,
      customPrice: 'Custom Pricing',
      billingPeriod: 'year',
      maxUsers: 999,
      features: [
        'Unlimited team members',
        'Everything in Enterprise',
        'Custom development',
        'Dedicated infrastructure',
        'White-label solution',
        'Custom integrations',
        'Training & onboarding',
        'Dedicated support team',
        'Custom SLA',
        'On-premise deployment'
      ],
      recommended: false,
      popular: false,
      buttonText: 'Contact Sales',
      stripePriceId: undefined
    }
  ];

  // Feature comparison data
  featureComparison: Feature[] = [
    {
      category: 'Team & Users',
      features: [
        { name: 'Team members', starter: '5 users', professional: '25 users', enterprise: '100 users', custom: 'Unlimited' },
        { name: 'User roles & permissions', starter: 'Basic', professional: true, enterprise: true, custom: true },
        { name: 'Team collaboration', starter: false, professional: true, enterprise: true, custom: true },
        { name: 'Guest access', starter: false, professional: true, enterprise: true, custom: true }
      ]
    },
    {
      category: 'Time Tracking',
      features: [
        { name: 'Unlimited projects', starter: true, professional: true, enterprise: true, custom: true },
        { name: 'Basic time tracking', starter: true, professional: true, enterprise: true, custom: true },
        { name: 'Advanced time tracking', starter: false, professional: true, enterprise: true, custom: true },
        { name: 'Automatic time detection', starter: false, professional: true, enterprise: true, custom: true },
        { name: 'Time tracking reminders', starter: false, professional: true, enterprise: true, custom: true }
      ]
    },
    {
      category: 'Reporting & Analytics',
      features: [
        { name: 'Basic reports', starter: true, professional: true, enterprise: true, custom: true },
        { name: 'Advanced analytics', starter: false, professional: true, enterprise: true, custom: true },
        { name: 'Custom reports', starter: false, professional: true, enterprise: true, custom: true },
        { name: 'Real-time dashboards', starter: false, professional: true, enterprise: true, custom: true },
        { name: 'Export to Excel/PDF', starter: 'PDF only', professional: true, enterprise: true, custom: true }
      ]
    },
    {
      category: 'Integrations',
      features: [
        { name: 'Basic integrations', starter: '3 apps', professional: '15 apps', enterprise: 'Unlimited', custom: 'Unlimited' },
        { name: 'API access', starter: false, professional: 'Limited', enterprise: true, custom: true },
        { name: 'Webhooks', starter: false, professional: true, enterprise: true, custom: true },
        { name: 'Custom integrations', starter: false, professional: false, enterprise: true, custom: true }
      ]
    },
    {
      category: 'Support & Security',
      features: [
        { name: 'Email support', starter: true, professional: true, enterprise: true, custom: true },
        { name: 'Priority support', starter: false, professional: true, enterprise: true, custom: true },
        { name: '24/7 phone support', starter: false, professional: false, enterprise: true, custom: true },
        { name: 'Dedicated account manager', starter: false, professional: false, enterprise: true, custom: true },
        { name: 'SSO integration', starter: false, professional: false, enterprise: true, custom: true },
        { name: 'Advanced security', starter: false, professional: false, enterprise: true, custom: true }
      ]
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
      this.isLoggedIn = !!user;
    });
  }

  get currentPlans(): PricingPlan[] {
    return this.billingCycle === 'monthly' ? this.monthlyPlans : this.yearlyPlans;
  }

  toggleBillingCycle(): void {
    this.billingCycle = this.billingCycle === 'monthly' ? 'yearly' : 'monthly';
  }

  selectPlan(plan: PricingPlan): void {
    if (plan.id === 'custom') {
      this.contactSales();
      return;
    }

    if (!this.isLoggedIn) {
      // Redirect to registration with plan selection
      this.router.navigate(['/register'], { 
        queryParams: { plan: plan.id, billing: this.billingCycle } 
      });
      return;
    }

    // TODO: Implement Stripe checkout
    this.toastService.success('Redirecting', 'Taking you to checkout...');
    console.log('Selected plan:', plan);
    // Implement actual Stripe checkout flow here
  }

  contactSales(): void {
    // TODO: Implement contact sales flow
    this.toastService.info('Contact Sales', 'Opening contact form...');
    // Could open a modal, redirect to contact page, or start a chat
  }

  startFreeTrial(): void {
    if (!this.isLoggedIn) {
      this.router.navigate(['/register'], { 
        queryParams: { trial: true } 
      });
      return;
    }

    // TODO: Implement free trial activation
    this.toastService.success('Free Trial', 'Your 14-day free trial has started!');
  }

  formatPrice(plan: PricingPlan): string {
    if (plan.customPrice) {
      return plan.customPrice;
    }
    
    const price = plan.price;
    const period = plan.billingPeriod === 'month' ? 'month' : 'month';
    const yearlyNote = plan.billingPeriod === 'year' ? ' (billed yearly)' : '';
    
    return `$${price}/${period}${yearlyNote}`;
  }

  getAnnualPrice(monthlyPrice: number): number {
    return monthlyPrice * 12;
  }

  getYearlySavings(monthlyPrice: number, yearlyPrice: number): number {
    const yearlyTotal = yearlyPrice * 12;
    const monthlyTotal = monthlyPrice * 12;
    return monthlyTotal - yearlyTotal;
  }

  getSavingsPercentage(): number {
    return 20; // 20% savings for yearly billing
  }

  getFeatureValue(feature: any, plan: string): string | boolean {
    const value = feature[plan as keyof typeof feature];
    if (typeof value === 'boolean') {
      return value;
    }
    return value || false;
  }

  isFeatureIncluded(feature: any, plan: string): boolean {
    const value = this.getFeatureValue(feature, plan);
    return value === true || (typeof value === 'string' && value !== 'false');
  }

  getFeatureDisplayValue(feature: any, plan: string): string {
    const value = this.getFeatureValue(feature, plan);
    if (typeof value === 'string') {
      return value;
    }
    return value ? '✓' : '✗';
  }
}