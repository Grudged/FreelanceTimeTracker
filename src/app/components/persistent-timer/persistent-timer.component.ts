import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { TimerService, ActiveTimer } from '../../services/timer.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-persistent-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './persistent-timer.component.html',
  styleUrl: './persistent-timer.component.css'
})
export class PersistentTimerComponent implements OnInit, OnDestroy {
  activeTimer: ActiveTimer | null = null;
  isMinimized = false;
  private subscription: Subscription = new Subscription();

  constructor(
    private timerService: TimerService,
    private toastService: ToastService,
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

  addBreak(): void {
    this.timerService.addBreak();
    this.toastService.info(
      'Break logged ☕',
      'Short break added to your work session',
      2000
    );
  }

  async stopTimer(): Promise<void> {
    try {
      const result = await this.timerService.stopTimer();
      if (result && result.success) {
        this.toastService.success(
          'Work session completed! 🎉',
          `Duration: ${result.duration} • Time entry saved successfully`,
          5000
        );
      }
    } catch (error: any) {
      this.toastService.error(
        'Work session completed',
        `Duration: ${error.duration} • Error saving: ${error.error}`,
        7000
      );
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}