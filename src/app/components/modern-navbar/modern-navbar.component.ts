import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';

@Component({
  selector: 'app-modern-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeSelectorComponent],
  templateUrl: './modern-navbar.component.html',
  styleUrl: './modern-navbar.component.css'
})
export class ModernNavbarComponent {
  @Input() currentUser: any = null;
  @Input() currentRoute: string = '';
  
  @Output() newProject = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  showUserMenu = false;
  showMobileMenu = false;

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'User';
    return this.currentUser.firstName || this.currentUser.username || 'User';
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'U';
    
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName[0]}${this.currentUser.lastName[0]}`.toUpperCase();
    }
    
    return this.currentUser.username ? this.currentUser.username[0].toUpperCase() : 'U';
  }

  isActiveRoute(route: string): boolean {
    return this.currentRoute === route;
  }

  onNewProject(): void {
    this.newProject.emit();
  }

  onLogout(): void {
    this.logout.emit();
  }

  // Role-based navigation helpers
  isOwnerOrAdmin(): boolean {
    if (!this.currentUser) return false;
    // TODO: Check actual user role from organization
    // For now, assume all logged-in users have access
    return true;
  }

  canAccessBilling(): boolean {
    return this.isOwnerOrAdmin();
  }

  canAccessOrganization(): boolean {
    return this.isOwnerOrAdmin();
  }
}