import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

export interface Organization {
  _id?: string;
  name: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'custom';
  maxUsers: number;
  currentUsers: number;
  status: 'active' | 'suspended' | 'trial';
  createdAt?: Date;
  updatedAt?: Date;
  subscription?: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    status: 'active' | 'inactive' | 'past_due' | 'canceled';
    currentPeriodStart: Date;
    currentPeriodEnd: Date;
    nextBillingAmount: number;
    currency: string;
  };
}

export interface TeamMember {
  _id?: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  status: 'active' | 'invited' | 'suspended';
  joinedAt?: Date;
  invitedAt?: Date;
  invitedBy?: string;
}

export interface InviteRequest {
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = environment?.apiUrl || 'http://localhost:3000/api';
  private currentOrganizationSubject = new BehaviorSubject<Organization | null>(null);
  public currentOrganization$ = this.currentOrganizationSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Organization Management
  getOrganization(): Observable<{ organization: Organization }> {
    return this.http.get<{ organization: Organization }>(`${this.apiUrl}/organization`);
  }

  updateOrganization(orgData: Partial<Organization>): Observable<{ organization: Organization }> {
    return this.http.put<{ organization: Organization }>(`${this.apiUrl}/organization`, orgData);
  }

  createOrganization(orgData: { name: string; plan: string }): Observable<{ organization: Organization }> {
    return this.http.post<{ organization: Organization }>(`${this.apiUrl}/organization`, orgData);
  }

  // Team Member Management
  getTeamMembers(): Observable<{ members: TeamMember[] }> {
    return this.http.get<{ members: TeamMember[] }>(`${this.apiUrl}/organization/members`);
  }

  inviteTeamMember(inviteData: InviteRequest): Observable<{ message: string; invitation: any }> {
    return this.http.post<{ message: string; invitation: any }>(
      `${this.apiUrl}/organization/invite`, 
      inviteData
    );
  }

  updateMemberRole(memberId: string, role: 'admin' | 'member' | 'viewer'): Observable<{ message: string; member: TeamMember }> {
    return this.http.put<{ message: string; member: TeamMember }>(
      `${this.apiUrl}/organization/members/${memberId}/role`, 
      { role }
    );
  }

  removeMember(memberId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/organization/members/${memberId}`);
  }

  suspendMember(memberId: string): Observable<{ message: string; member: TeamMember }> {
    return this.http.put<{ message: string; member: TeamMember }>(
      `${this.apiUrl}/organization/members/${memberId}/suspend`, 
      {}
    );
  }

  reactivateMember(memberId: string): Observable<{ message: string; member: TeamMember }> {
    return this.http.put<{ message: string; member: TeamMember }>(
      `${this.apiUrl}/organization/members/${memberId}/reactivate`, 
      {}
    );
  }

  // Invitation Management
  acceptInvitation(token: string): Observable<{ message: string; organization: Organization }> {
    return this.http.post<{ message: string; organization: Organization }>(
      `${this.apiUrl}/organization/accept-invite`, 
      { token }
    );
  }

  resendInvitation(invitationId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/organization/resend-invite/${invitationId}`, 
      {}
    );
  }

  cancelInvitation(invitationId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/organization/invitations/${invitationId}`);
  }

  // Organization Statistics
  getOrganizationStats(): Observable<{
    stats: {
      totalMembers: number;
      activeMembers: number;
      totalProjects: number;
      totalTimeEntries: number;
      storageUsed: number;
      planLimits: {
        maxUsers: number;
        maxProjects: number;
        maxStorage: number;
      };
    }
  }> {
    return this.http.get<any>(`${this.apiUrl}/organization/stats`);
  }

  // User Role Checking
  getCurrentUserRole(): Observable<{ role: 'owner' | 'admin' | 'member' | 'viewer' }> {
    return this.http.get<{ role: 'owner' | 'admin' | 'member' | 'viewer' }>(`${this.apiUrl}/organization/my-role`);
  }

  // Utility Methods
  setCurrentOrganization(organization: Organization): void {
    this.currentOrganizationSubject.next(organization);
  }

  getCurrentOrganization(): Organization | null {
    return this.currentOrganizationSubject.value;
  }

  isOwner(userRole: string): boolean {
    return userRole === 'owner';
  }

  isAdmin(userRole: string): boolean {
    return ['owner', 'admin'].includes(userRole);
  }

  canManageMembers(userRole: string): boolean {
    return this.isAdmin(userRole);
  }

  canInviteMembers(userRole: string): boolean {
    return this.isAdmin(userRole);
  }

  canChangePlan(userRole: string): boolean {
    return this.isOwner(userRole);
  }
}