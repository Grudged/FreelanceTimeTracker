import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TimerService, ActiveTimer } from '../../services/timer.service';

@Component({
  selector: 'app-persistent-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="persistent-timer" *ngIf="activeTimer" [class.minimized]="isMinimized">
      <div class="timer-header" (click)="toggleMinimized()">
        <div class="timer-info">
          <div class="project-title">{{ activeTimer.projectTitle }}</div>
          <div class="timer-duration">{{ activeTimer.duration }}</div>
        </div>
        <div class="timer-controls">
          <button class="minimize-btn" [title]="isMinimized ? 'Expand' : 'Minimize'">
            {{ isMinimized ? '▶' : '◀' }}
          </button>
        </div>
      </div>
      
      <div class="timer-body" *ngIf="!isMinimized">
        <div class="timer-status">
          <span class="status-indicator"></span>
          <span class="status-text">Recording time</span>
        </div>
        
        <div class="timer-actions">
          <button (click)="stopTimer()" class="stop-btn">
            <span class="btn-icon">⏹️</span>
            Stop Timer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .persistent-timer {
      position: fixed;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      z-index: 10000;
      background: linear-gradient(145deg, rgba(45, 62, 45, 0.95) 0%, rgba(61, 79, 61, 0.95) 100%);
      border: 2px solid rgba(74, 124, 74, 0.8);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(10px);
      min-width: 280px;
      max-width: 320px;
      transition: all 0.3s ease;
      animation: slideIn 0.3s ease-out;
    }

    .persistent-timer.minimized {
      min-width: 200px;
      max-width: 200px;
    }

    @keyframes slideIn {
      from {
        transform: translateY(-50%) translateX(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(-50%) translateX(0);
        opacity: 1;
      }
    }

    .timer-header {
      padding: 1rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(74, 124, 74, 0.3);
    }

    .timer-header:hover {
      background: rgba(74, 124, 74, 0.2);
    }

    .timer-info {
      flex: 1;
      min-width: 0;
    }

    .project-title {
      color: #e8f5e8;
      font-weight: 600;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 0.25rem;
    }

    .timer-duration {
      color: #8eb68e;
      font-size: 1.2rem;
      font-weight: 700;
      font-family: 'Courier New', monospace;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.7; }
      100% { opacity: 1; }
    }

    .timer-controls {
      margin-left: 1rem;
    }

    .minimize-btn {
      background: none;
      border: none;
      color: #a0c0a0;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .minimize-btn:hover {
      background: rgba(74, 124, 74, 0.3);
      color: #e8f5e8;
    }

    .timer-body {
      padding: 1rem;
      animation: expandIn 0.3s ease-out;
    }

    @keyframes expandIn {
      from {
        opacity: 0;
        max-height: 0;
        padding-top: 0;
        padding-bottom: 0;
      }
      to {
        opacity: 1;
        max-height: 200px;
        padding-top: 1rem;
        padding-bottom: 1rem;
      }
    }

    .timer-status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #28a745;
      animation: blink 2s infinite;
    }

    @keyframes blink {
      0%, 50% { opacity: 1; }
      51%, 100% { opacity: 0.3; }
    }

    .status-text {
      color: #c7d2c7;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .timer-actions {
      display: flex;
      justify-content: center;
    }

    .stop-btn {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
      width: 100%;
      justify-content: center;
    }

    .stop-btn:hover {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    }

    .stop-btn:active {
      transform: translateY(0);
    }

    .btn-icon {
      font-size: 1rem;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .persistent-timer {
        left: 10px;
        min-width: 250px;
        max-width: 280px;
      }

      .persistent-timer.minimized {
        min-width: 180px;
        max-width: 180px;
      }

      .timer-header {
        padding: 0.75rem;
      }

      .timer-body {
        padding: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .persistent-timer {
        left: 5px;
        min-width: 220px;
        max-width: 250px;
      }

      .persistent-timer.minimized {
        min-width: 160px;
        max-width: 160px;
      }
    }
  `]
})
export class PersistentTimerComponent implements OnInit, OnDestroy {
  activeTimer: ActiveTimer | null = null;
  isMinimized = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private timerService: TimerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to timer updates
    this.subscription.add(
      this.timerService.activeTimer$.subscribe(timer => {
        this.activeTimer = timer;
        // Force change detection when timer updates
        this.cdr.detectChanges();
      })
    );
  }

  toggleMinimized(): void {
    this.isMinimized = !this.isMinimized;
  }

  async stopTimer(): Promise<void> {
    try {
      const result = await this.timerService.stopTimer();
      if (result && result.success) {
        // Show success message - you might want to use a toast service here
        alert(`Work session completed! Duration: ${result.duration}\nTime entry saved successfully.`);
      }
    } catch (error: any) {
      // Show error message
      alert(`Work session completed! Duration: ${error.duration}\nError saving time entry: ${error.error}`);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}