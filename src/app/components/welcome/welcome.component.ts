import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, ThemeSelectorComponent],
  template: `
    <div class="welcome-container">
      <div class="theme-selector-container">
        <app-theme-selector></app-theme-selector>
      </div>
      
      <div class="welcome-content">
        <div class="hero-section">
          <h1 class="hero-title">Stack to the Future</h1>
          <h2 class="hero-subtitle">Freelance Time Tracker</h2>
          <p class="hero-description">
            Track your time, manage your projects, and grow your freelance business with our comprehensive time tracking solution.
          </p>
        </div>

        <div class="action-buttons">
          <button 
            class="btn btn-primary btn-lg"
            (click)="navigateToRegister()"
          >
            <i class="icon-plus"></i>
            Create New Account
          </button>
          
          <button 
            class="btn btn-outline-primary btn-lg"
            (click)="navigateToLogin()"
          >
            <i class="icon-login"></i>
            Log In
          </button>
        </div>

        <div class="features-preview">
          <div class="feature">
            <i class="icon-clock"></i>
            <h3>Time Tracking</h3>
            <p>Accurate time tracking with detailed logs</p>
          </div>
          <div class="feature">
            <i class="icon-folder"></i>
            <h3>Project Management</h3>
            <p>Organize your work by projects and clients</p>
          </div>
          <div class="feature">
            <i class="icon-chart"></i>
            <h3>Earnings Analytics</h3>
            <p>Track your earnings and productivity</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-background, linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3d5a3d 100%));
      background-attachment: fixed;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .welcome-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(45, 91, 45, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(74, 124, 74, 0.2) 0%, transparent 50%);
      pointer-events: none;
    }

    .theme-selector-container {
      position: absolute;
      top: 1rem;
      right: 1rem;
      z-index: 10;
    }

    .welcome-content {
      max-width: 600px;
      text-align: center;
      color: var(--color-text-primary, #f0fff0);
      position: relative;
      z-index: 1;
    }

    .hero-section {
      margin-bottom: 3rem;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
      color: var(--color-text-primary, #f0fff0);
    }

    .hero-subtitle {
      font-size: 1.8rem;
      font-weight: 300;
      margin-bottom: 1rem;
      opacity: 0.9;
      color: var(--color-text-secondary, #e8f5e8);
    }

    .hero-description {
      font-size: 1.1rem;
      line-height: 1.6;
      opacity: 0.8;
      max-width: 500px;
      margin: 0 auto;
      color: var(--color-text-secondary, #e8f5e8);
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 4rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 1rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      text-decoration: none;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #2d5b2d 0%, #4a7c4a 100%);
      color: #f0fff0;
      box-shadow: 0 4px 16px rgba(45, 91, 45, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #367d36 0%, #5a9c5a 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(45, 91, 45, 0.4);
    }

    .btn-outline-primary {
      background: transparent;
      color: #a6d4a6;
      border: 2px solid #a6d4a6;
    }

    .btn-outline-primary:hover {
      background: #a6d4a6;
      color: #1a2e1a;
      transform: translateY(-2px);
    }

    .features-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 2rem;
      margin-top: 2rem;
    }

    .feature {
      text-align: center;
      padding: 1.5rem;
      background: rgba(45, 91, 45, 0.2);
      border-radius: 12px;
      border: 1px solid rgba(74, 124, 74, 0.3);
      backdrop-filter: blur(10px);
      transition: transform 0.3s ease;
    }

    .feature:hover {
      transform: translateY(-4px);
      background: rgba(45, 91, 45, 0.3);
    }

    .feature i {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #8eb68e;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .feature h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--color-accent, #a6d4a6);
    }

    .feature p {
      font-size: 0.9rem;
      opacity: 0.8;
      line-height: 1.4;
      color: var(--color-text-secondary, #e0f0e0);
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }
      
      .action-buttons {
        flex-direction: column;
        align-items: center;
      }
      
      .btn {
        width: 100%;
        max-width: 300px;
      }
    }
  `]
})
export class WelcomeComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // If user is already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['/auth/register']);
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
