import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { OrganizationService, Organization, TeamMember, InviteRequest } from '../../services/organization.service';

// Interfaces now imported from service

@Component({
  selector: 'app-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organization.component.html',
  styleUrl: './organization.component.css'
})
export class OrganizationComponent implements OnInit {
  currentUser: any = null;
  organization: Organization | null = null;
  teamMembers: TeamMember[] = [];
  isLoading = true;
  isOwner = false;
  isAdmin = false;

  // Modals
  showEditOrgModal = false;
  showInviteModal = false;
  showUpgradeModal = false;

  // Forms
  editOrgForm = {
    name: ''
  };

  inviteForm = {
    email: '',
    role: 'member' as 'admin' | 'member' | 'viewer'
  };

  // Plan details
  planDetails = {
    starter: { maxUsers: 5, price: 19, features: ['Basic time tracking', 'Project management', 'Monthly reports'] },
    professional: { maxUsers: 25, price: 49, features: ['Everything in Starter', 'Advanced analytics', 'Team collaboration', 'Custom integrations'] },
    enterprise: { maxUsers: 100, price: 149, features: ['Everything in Professional', 'Priority support', 'Custom workflows', 'Advanced security'] },
    custom: { maxUsers: 999, price: 'Contact Sales', features: ['Everything in Enterprise', 'Custom development', 'Dedicated support', 'SLA guarantee'] }
  };

  constructor(
    private authService: AuthService,
    private organizationService: OrganizationService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadOrganizationData();
      }
    });
  }

  loadOrganizationData(): void {
    this.isLoading = true;
    
    // Load organization data
    this.organizationService.getOrganization().subscribe({
      next: (response) => {
        this.organization = response.organization;
        this.editOrgForm.name = this.organization.name;
        this.loadTeamMembers();
      },
      error: (error) => {
        console.error('Error loading organization:', error);
        this.toastService.error('Error', 'Failed to load organization data');
        this.isLoading = false;
      }
    });
  }

  loadTeamMembers(): void {
    this.organizationService.getTeamMembers().subscribe({
      next: (response) => {
        this.teamMembers = response.members;
        this.checkUserRole();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading team members:', error);
        this.toastService.error('Error', 'Failed to load team members');
        this.isLoading = false;
      }
    });
  }

  checkUserRole(): void {
    this.organizationService.getCurrentUserRole().subscribe({
      next: (response) => {
        const userRole = response.role;
        this.isOwner = this.organizationService.isOwner(userRole);
        this.isAdmin = this.organizationService.isAdmin(userRole);
      },
      error: (error) => {
        console.error('Error checking user role:', error);
        // Fallback to checking from team members
        this.isOwner = this.teamMembers.some(member => 
          member.email === this.currentUser?.email && member.role === 'owner'
        );
        this.isAdmin = this.teamMembers.some(member => 
          member.email === this.currentUser?.email && 
          ['owner', 'admin'].includes(member.role)
        );
      }
    });
  }

  // Organization Management
  openEditOrgModal(): void {
    this.editOrgForm.name = this.organization?.name || '';
    this.showEditOrgModal = true;
  }

  saveOrganization(): void {
    if (!this.editOrgForm.name.trim()) {
      this.toastService.error('Error', 'Organization name is required');
      return;
    }

    this.organizationService.updateOrganization({ name: this.editOrgForm.name }).subscribe({
      next: (response) => {
        this.organization = response.organization;
        this.showEditOrgModal = false;
        this.toastService.success('Success', 'Organization updated successfully');
      },
      error: (error) => {
        console.error('Error updating organization:', error);
        this.toastService.error('Error', 'Failed to update organization');
      }
    });
  }

  // Team Management
  openInviteModal(): void {
    this.inviteForm = { email: '', role: 'member' };
    this.showInviteModal = true;
  }

  sendInvitation(): void {
    if (!this.inviteForm.email.trim()) {
      this.toastService.error('Error', 'Email is required');
      return;
    }

    const inviteRequest: InviteRequest = {
      email: this.inviteForm.email,
      role: this.inviteForm.role
    };

    this.organizationService.inviteTeamMember(inviteRequest).subscribe({
      next: (response) => {
        this.showInviteModal = false;
        this.toastService.success('Success', `Invitation sent to ${this.inviteForm.email}`);
        this.loadTeamMembers(); // Refresh team members
      },
      error: (error) => {
        console.error('Error sending invitation:', error);
        this.toastService.error('Error', 'Failed to send invitation');
      }
    });
  }

  updateMemberRole(member: TeamMember, newRole: 'admin' | 'member' | 'viewer'): void {
    if (!this.isAdmin) {
      this.toastService.error('Error', 'You do not have permission to change user roles');
      return;
    }

    if (!member._id) {
      this.toastService.error('Error', 'Invalid member data');
      return;
    }

    this.organizationService.updateMemberRole(member._id, newRole).subscribe({
      next: (response) => {
        member.role = newRole;
        this.toastService.success('Success', `${member.firstName || member.username}'s role updated to ${newRole}`);
      },
      error: (error) => {
        console.error('Error updating member role:', error);
        this.toastService.error('Error', 'Failed to update member role');
      }
    });
  }

  removeMember(member: TeamMember): void {
    if (!this.isAdmin) {
      this.toastService.error('Error', 'You do not have permission to remove users');
      return;
    }

    if (member.role === 'owner') {
      this.toastService.error('Error', 'Cannot remove organization owner');
      return;
    }

    if (!member._id) {
      this.toastService.error('Error', 'Invalid member data');
      return;
    }

    if (confirm('Are you sure you want to remove this team member?')) {
      this.organizationService.removeMember(member._id).subscribe({
        next: () => {
          this.teamMembers = this.teamMembers.filter(m => m._id !== member._id);
          this.toastService.success('Success', `${member.firstName || member.username} removed from organization`);
        },
        error: (error) => {
          console.error('Error removing member:', error);
          this.toastService.error('Error', 'Failed to remove team member');
        }
      });
    }
  }

  // Subscription Management
  openUpgradeModal(): void {
    this.showUpgradeModal = true;
  }

  upgradePlan(newPlan: string): void {
    if (!this.isOwner) {
      this.toastService.error('Error', 'Only organization owners can change subscription plans');
      return;
    }

    // TODO: Implement Stripe integration
    if (this.organization) {
      this.organization.plan = newPlan as any;
      this.organization.maxUsers = this.getPlanDetails(newPlan).maxUsers;
      this.showUpgradeModal = false;
      this.toastService.success('Success', `Plan upgraded to ${newPlan}`);
    }
  }

  cancelSubscription(): void {
    if (!this.isOwner) {
      this.toastService.error('Error', 'Only organization owners can cancel subscriptions');
      return;
    }

    if (confirm('Are you sure you want to cancel your subscription? This action cannot be undone.')) {
      // TODO: Implement API call
      this.toastService.warning('Subscription Canceled', 'Your subscription will remain active until the current billing period ends');
    }
  }

  // Plan Details Helper
  getPlanDetails(plan: string): any {
    return this.planDetails[plan as keyof typeof this.planDetails] || this.planDetails.starter;
  }

  // Utility Methods
  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'badge-success';
      case 'invited': return 'badge-warning';
      case 'suspended': return 'badge-error';
      case 'trial': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'owner': return 'badge-primary';
      case 'admin': return 'badge-secondary';
      case 'member': return 'badge-info';
      case 'viewer': return 'badge-muted';
      default: return 'badge-secondary';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getPlanProgress(): number {
    if (!this.organization) return 0;
    return Math.round((this.organization.currentUsers / this.organization.maxUsers) * 100);
  }

  closeModal(): void {
    this.showEditOrgModal = false;
    this.showInviteModal = false;
    this.showUpgradeModal = false;
  }
}