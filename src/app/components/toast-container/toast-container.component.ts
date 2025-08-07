import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div 
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        class="toast"
        [class]="'toast-' + toast.type"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span>{{ getToastIcon(toast.type) }}</span>
          </div>
          
          <div class="toast-body">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message">{{ toast.message }}</div>
            
            <div class="toast-actions" *ngIf="toast.actions && toast.actions.length > 0">
              <button 
                *ngFor="let action of toast.actions"
                (click)="action.handler()"
                class="toast-action"
              >
                {{ action.label }}
              </button>
            </div>
          </div>
          
          <button 
            class="toast-close"
            (click)="closeToast(toast.id)"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
        
        <div class="toast-progress" *ngIf="toast.duration">
          <div class="toast-progress-bar" [style.animation-duration.ms]="toast.duration"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      max-width: 420px;
      width: 100%;
      pointer-events: none;
    }

    .toast {
      pointer-events: auto;
      background: var(--color-surface, linear-gradient(145deg, rgba(61, 79, 61, 0.95) 0%, rgba(45, 62, 45, 0.95) 100%));
      backdrop-filter: blur(20px);
      border-radius: 12px;
      border: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      overflow: hidden;
      position: relative;
      animation: slideInFromRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toast-success {
      border-left: 4px solid var(--color-success, #10b981);
    }

    .toast-error {
      border-left: 4px solid var(--color-error, #ef4444);
    }

    .toast-warning {
      border-left: 4px solid var(--color-warning, #f59e0b);
    }

    .toast-info {
      border-left: 4px solid var(--color-info, #3b82f6);
    }

    .toast-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      margin-top: 0.125rem;
    }

    .toast-body {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      color: var(--color-text-primary, #f0fff0);
      margin-bottom: 0.25rem;
      line-height: 1.4;
    }

    .toast-message {
      color: var(--color-text-secondary, #e8f5e8);
      font-size: 0.875rem;
      line-height: 1.4;
      word-break: break-word;
    }

    .toast-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .toast-action {
      background: none;
      border: 1px solid var(--color-border, rgba(74, 124, 74, 0.4));
      border-radius: 6px;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      color: var(--color-text-primary, #f0fff0);
    }

    .toast-action:hover {
      background: var(--color-border-light, rgba(74, 124, 74, 0.2));
      border-color: var(--color-accent, #8eb68e);
    }

    .toast-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      line-height: 1;
      cursor: pointer;
      color: var(--color-text-muted, #a0c0a0);
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: all 0.2s;
      margin-top: 0.125rem;
      flex-shrink: 0;
    }

    .toast-close:hover {
      background: rgba(142, 182, 142, 0.2);
      color: var(--color-text-secondary, #e8f5e8);
    }

    .toast-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(0, 0, 0, 0.1);
    }

    .toast-progress-bar {
      height: 100%;
      background: currentColor;
      animation: progress linear;
      width: 100%;
      transform-origin: left;
    }

    .toast-success .toast-progress-bar {
      color: var(--color-success, #10b981);
    }

    .toast-error .toast-progress-bar {
      color: var(--color-error, #ef4444);
    }

    .toast-warning .toast-progress-bar {
      color: var(--color-warning, #f59e0b);
    }

    .toast-info .toast-progress-bar {
      color: var(--color-info, #3b82f6);
    }

    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast-content {
        padding: 0.875rem;
        gap: 0.5rem;
      }

      .toast-actions {
        flex-direction: column;
      }

      .toast-action {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('ToastContainer ngOnInit called');
    this.subscription.add(
      this.toastService.toasts$.subscribe(toasts => {
        console.log('ToastContainer received toasts:', toasts.length, toasts);
        this.toasts = toasts;
        // Use markForCheck instead of detectChanges to avoid timing issues
        this.cdr.markForCheck();
      })
    );
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  getToastIcon(type: string): string {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type as keyof typeof icons] || 'ℹ️';
  }

  closeToast(id: string): void {
    this.toastService.remove(id);
    // Use markForCheck instead of detectChanges
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}