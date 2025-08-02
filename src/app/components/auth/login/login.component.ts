import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, LoginCredentials } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="form-control"
              [class.error]="isFieldInvalid('username')"
              placeholder="Enter your username or email"
            />
            <div *ngIf="isFieldInvalid('username')" class="error-message">
              Username or email is required
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.error]="isFieldInvalid('password')"
              placeholder="Enter your password"
            />
            <div *ngIf="isFieldInvalid('password')" class="error-message">
              Password is required
            </div>
          </div>

          <div *ngIf="errorMessage" class="alert alert-error">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner"></span>
            {{ isLoading ? 'Signing In...' : 'Sign In' }}
          </button>
        </form>

        <div class="auth-footer">
          <p>
            Don't have an account?
            <a routerLink="/auth/register" class="link">Sign up here</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 50%, #3d5a3d 100%);
      padding: 1rem;
      position: relative;
    }

    .auth-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        radial-gradient(circle at 30% 70%, rgba(45, 91, 45, 0.2) 0%, transparent 50%),
        radial-gradient(circle at 70% 30%, rgba(74, 124, 74, 0.1) 0%, transparent 50%);
      pointer-events: none;
    }

    .auth-card {
      background: linear-gradient(145deg, rgba(61, 79, 61, 0.9) 0%, rgba(45, 62, 45, 0.9) 100%);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 15px 35px rgba(0,0,0,0.4);
      border: 1px solid rgba(74, 124, 74, 0.3);
      backdrop-filter: blur(10px);
      width: 100%;
      max-width: 400px;
      position: relative;
      z-index: 1;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-header h1 {
      color: #f0fff0;
      margin-bottom: 0.5rem;
      font-size: 1.8rem;
      font-weight: 600;
    }

    .auth-header p {
      color: #a0c0a0;
      margin: 0;
    }

    .auth-form {
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #e8f5e8;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid rgba(74, 124, 74, 0.4);
      border-radius: 8px;
      font-size: 1rem;
      background-color: rgba(45, 91, 45, 0.2);
      color: #e8f5e8;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-control::placeholder {
      color: #a0c0a0;
    }

    .form-control:focus {
      outline: none;
      border-color: #4a7c4a;
      background-color: rgba(45, 91, 45, 0.3);
      box-shadow: 0 0 0 3px rgba(74, 124, 74, 0.2);
    }

    .form-control.error {
      border-color: #cd5c5c;
    }

    .error-message {
      color: #cd5c5c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .alert {
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .alert-error {
      background-color: rgba(205, 92, 92, 0.2);
      color: #cd5c5c;
      border: 1px solid #cd5c5c;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-primary {
      background: linear-gradient(135deg, #2d5b2d 0%, #4a7c4a 100%);
      color: #f0fff0;
      border: none;
      box-shadow: 0 4px 12px rgba(45, 91, 45, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #367d36 0%, #5a9c5a 100%);
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(45, 91, 45, 0.4);
    }

    .btn-primary:disabled {
      background: rgba(74, 124, 74, 0.3);
      cursor: not-allowed;
      box-shadow: none;
    }

    .btn-full {
      width: 100%;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      text-align: center;
      padding-top: 1rem;
      border-top: 1px solid rgba(74, 124, 74, 0.3);
    }

    .auth-footer p {
      margin: 0;
      color: #a0c0a0;
    }

    .link {
      color: #8eb68e;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      color: #a6d4a6;
      text-decoration: underline;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // If user is already authenticated, redirect to dashboard
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/dashboard']);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const credentials: LoginCredentials = this.loginForm.value;

      this.authService.login(credentials).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          console.log('Login successful:', response);
          this.router.navigate(['/dashboard']);
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Login error:', error);
          this.errorMessage = error.error?.message || 'Login failed. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }
}
