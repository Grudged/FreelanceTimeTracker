import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';

@Component({
  selector: 'app-modern-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeSelectorComponent],
  template: `
    <nav class="modern-navbar">
      <div class="navbar-container">
        <!-- Brand Section -->
        <div class="nav-brand">
          <div class="brand-content">
            <div class="brand-logo" title="GG Logo"></div>
            <div class="brand-text">
              <h1 class="brand-title">Stack to the Future</h1>
              <span class="brand-tagline">Time Tracker</span>
            </div>
          </div>
        </div>

        <!-- Navigation Links -->
        <div class="nav-links">
          <a 
            routerLink="/dashboard" 
            routerLinkActive="active"
            class="nav-link"
            [class.active]="isActiveRoute('/dashboard')"
          >
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </a>
          
          <a 
            routerLink="/projects" 
            routerLinkActive="active"
            class="nav-link"
            [class.active]="isActiveRoute('/projects')"
          >
            <span class="nav-icon">📁</span>
            <span class="nav-text">Projects</span>
          </a>

          <button 
            (click)="onNewProject()" 
            class="nav-link nav-button"
            title="Create new project"
          >
            <span class="nav-icon">➕</span>
            <span class="nav-text">New Project</span>
          </button>
        </div>

        <!-- User Section -->
        <div class="nav-user">
          <app-theme-selector></app-theme-selector>
          
          <div class="user-dropdown" [class.open]="showUserMenu">
            <button 
              class="user-button" 
              (click)="toggleUserMenu()"
              [attr.aria-expanded]="showUserMenu"
            >
              <span class="user-name">{{ getUserDisplayName() }}</span>
              <div class="user-avatar">
                {{ getUserInitials() }}
              </div>
              <span class="dropdown-arrow" [class.rotated]="showUserMenu">⌄</span>
            </button>
            
            <div class="dropdown-menu" [class.visible]="showUserMenu">
              <a routerLink="/profile" class="dropdown-item">
                <span class="dropdown-icon">👤</span>
                Profile
              </a>
              <button (click)="onLogout()" class="dropdown-item logout-btn">
                <span class="dropdown-icon">🚪</span>
                Logout
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Menu Toggle -->
        <button 
          class="mobile-menu-toggle"
          (click)="toggleMobileMenu()"
          [attr.aria-expanded]="showMobileMenu"
          aria-label="Toggle navigation menu"
        >
          <span class="hamburger-line" [class.active]="showMobileMenu"></span>
          <span class="hamburger-line" [class.active]="showMobileMenu"></span>
          <span class="hamburger-line" [class.active]="showMobileMenu"></span>
        </button>
      </div>

      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.visible]="showMobileMenu">
        <div class="mobile-links">
          <a 
            routerLink="/dashboard" 
            class="mobile-link"
            (click)="closeMobileMenu()"
          >
            <span class="nav-icon">📊</span>
            Dashboard
          </a>
          
          <a 
            routerLink="/projects" 
            class="mobile-link"
            (click)="closeMobileMenu()"
          >
            <span class="nav-icon">📁</span>
            Projects
          </a>

          <button 
            (click)="onNewProject(); closeMobileMenu()" 
            class="mobile-link mobile-button"
          >
            <span class="nav-icon">➕</span>
            New Project
          </button>

          <a 
            routerLink="/profile" 
            class="mobile-link"
            (click)="closeMobileMenu()"
          >
            <span class="nav-icon">👤</span>
            Profile
          </a>

          <button 
            (click)="onLogout(); closeMobileMenu()" 
            class="mobile-link mobile-button logout"
          >
            <span class="nav-icon">🚪</span>
            Logout
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .modern-navbar {
      background: var(--color-surface, linear-gradient(145deg, rgba(61, 79, 61, 0.9) 0%, rgba(45, 62, 45, 0.9) 100%));
      border-bottom: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(20px);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 4rem;
    }

    .nav-brand {
      flex-shrink: 0;
    }

    .brand-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .brand-logo {
      width: 48px;
      height: 48px;
      background-image: url('/GGLogo.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      flex-shrink: 0;
      border-radius: 8px;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .brand-title {
      margin: 0;
      color: var(--color-accent, #8eb68e);
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
    }

    .brand-tagline {
      color: var(--color-text-muted, #666);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      justify-content: center;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      text-decoration: none;
      color: var(--color-text-muted, #666);
      font-weight: 500;
      font-size: 0.875rem;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .nav-link::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--color-accent, #8eb68e);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .nav-link:hover {
      color: var(--color-text-primary, #f0fff0);
      background: rgba(142, 182, 142, 0.1);
      transform: translateY(-1px);
    }

    .nav-link.active {
      color: var(--color-text-primary, #f0fff0);
      background: rgba(142, 182, 142, 0.2);
      box-shadow: 0 2px 8px rgba(142, 182, 142, 0.3);
    }

    .nav-button {
      background: none;
      border: 2px solid var(--color-primary-light, #4a7c4a);
      color: var(--color-primary-light, #4a7c4a);
      cursor: pointer;
    }

    .nav-button:hover {
      background: var(--color-primary-light, #4a7c4a);
      color: var(--color-text-primary, #f0fff0);
      border-color: var(--color-primary-light, #4a7c4a);
    }

    .nav-icon {
      font-size: 1rem;
    }

    .nav-text {
      font-weight: 500;
    }

    .nav-user {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-shrink: 0;
    }

    .user-dropdown {
      position: relative;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      color: var(--color-text-primary, #f0fff0);
      transition: all 0.3s ease;
    }

    .user-button:hover {
      background: rgba(142, 182, 142, 0.1);
    }

    .user-name {
      font-weight: 500;
      font-size: 0.875rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--color-accent, #8eb68e);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
      box-shadow: 0 2px 8px rgba(142, 182, 142, 0.3);
    }

    .dropdown-arrow {
      font-size: 0.875rem;
      transition: transform 0.3s ease;
    }

    .dropdown-arrow.rotated {
      transform: rotate(180deg);
    }

    .dropdown-menu {
      position: absolute;
      top: calc(100% + 0.5rem);
      right: 0;
      background: var(--color-surface, linear-gradient(145deg, rgba(61, 79, 61, 0.95) 0%, rgba(45, 62, 45, 0.95) 100%));
      border: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(20px);
      min-width: 180px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 1001;
    }

    .dropdown-menu.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.875rem 1rem;
      color: var(--color-text-primary, #f0fff0);
      text-decoration: none;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .dropdown-item:first-child {
      border-radius: 12px 12px 0 0;
    }

    .dropdown-item:last-child {
      border-radius: 0 0 12px 12px;
    }

    .dropdown-item:hover {
      background: rgba(142, 182, 142, 0.1);
    }

    .dropdown-icon {
      font-size: 1rem;
    }

    .logout-btn {
      color: #ff6b6b !important;
      border-top: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
    }

    .logout-btn:hover {
      background: rgba(255, 107, 107, 0.1) !important;
    }

    .mobile-menu-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 40px;
      height: 40px;
      background: none;
      border: none;
      cursor: pointer;
      gap: 4px;
    }

    .hamburger-line {
      width: 20px;
      height: 2px;
      background: var(--color-text-primary, #f0fff0);
      border-radius: 2px;
      transition: all 0.3s ease;
    }

    .hamburger-line.active:nth-child(1) {
      transform: rotate(45deg) translate(6px, 6px);
    }

    .hamburger-line.active:nth-child(2) {
      opacity: 0;
    }

    .hamburger-line.active:nth-child(3) {
      transform: rotate(-45deg) translate(6px, -6px);
    }

    .mobile-menu {
      display: none;
      background: var(--color-surface, linear-gradient(145deg, rgba(61, 79, 61, 0.95) 0%, rgba(45, 62, 45, 0.95) 100%));
      border-top: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
      backdrop-filter: blur(20px);
    }

    .mobile-menu.visible {
      display: block;
      animation: slideDown 0.3s ease-out;
    }

    .mobile-links {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .mobile-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      color: var(--color-text-primary, #f0fff0);
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s ease;
      font-weight: 500;
    }

    .mobile-button {
      background: none;
      border: none;
      cursor: pointer;
      text-align: left;
      width: 100%;
    }

    .mobile-link:hover,
    .mobile-button:hover {
      background: rgba(142, 182, 142, 0.1);
    }

    .mobile-link.logout {
      color: #ff6b6b !important;
      border-top: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
      margin-top: 0.5rem;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .nav-links,
      .nav-user app-theme-selector {
        display: none;
      }

      .mobile-menu-toggle {
        display: flex;
      }

      .brand-title {
        font-size: 1.125rem;
      }

      .brand-tagline {
        font-size: 0.6875rem;
      }

      .navbar-container {
        padding: 0 1rem;
        min-height: 3.5rem;
      }
    }

    @media (max-width: 480px) {
      .brand-text {
        display: none;
      }

      .brand-logo {
        width: 40px;
        height: 40px;
      }
    }
  `]
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
}