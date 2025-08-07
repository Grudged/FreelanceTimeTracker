import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimeEntryService } from './time-entry.service';

export interface ActiveTimer {
  projectId: string;
  projectTitle: string;
  startTime: Date;
  duration: string;
  isRunning: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private activeTimerSubject = new BehaviorSubject<ActiveTimer | null>(null);
  private intervalId: any = null;

  public activeTimer$ = this.activeTimerSubject.asObservable();

  constructor(private timeEntryService: TimeEntryService) {}

  startTimer(projectId: string, projectTitle: string): boolean {
    // Stop any existing timer first
    if (this.activeTimerSubject.value) {
      this.stopTimer();
    }

    const startTime = new Date();
    const timer: ActiveTimer = {
      projectId,
      projectTitle,
      startTime,
      duration: '00:00:00',
      isRunning: true
    };

    this.activeTimerSubject.next(timer);
    
    // Start the interval to update duration
    this.intervalId = setInterval(() => {
      this.updateTimerDuration();
    }, 1000);

    console.log(`Timer started for project: ${projectTitle}`);
    return true;
  }

  stopTimer(): Promise<any> {
    return new Promise((resolve, reject) => {
      const currentTimer = this.activeTimerSubject.value;
      if (!currentTimer) {
        resolve(null);
        return;
      }

      // Clear the interval
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }

      // Calculate duration
      const endTime = new Date();
      const durationMs = endTime.getTime() - currentTimer.startTime.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      console.log(`Timer stopped for project ${currentTimer.projectId}. Duration: ${durationHours.toFixed(2)} hours`);
      
      // Create time entry
      const timeEntryData = {
        projectId: currentTimer.projectId,
        startTime: currentTimer.startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: 'Work session',
        workLog: 'Time tracked via persistent timer'
      };

      // Clear the timer from state
      this.activeTimerSubject.next(null);

      // Create time entry in backend
      this.timeEntryService.createTimeEntry(timeEntryData).subscribe({
        next: (response) => {
          console.log('Time entry created successfully:', response);
          resolve({
            success: true,
            duration: this.formatDuration(durationMs),
            response
          });
        },
        error: (error) => {
          console.error('Error creating time entry:', error);
          reject({
            success: false,
            duration: this.formatDuration(durationMs),
            error: error.message || 'Unknown error'
          });
        }
      });
    });
  }

  isTimerRunning(projectId?: string): boolean {
    const timer = this.activeTimerSubject.value;
    if (!projectId) {
      return !!timer;
    }
    return timer?.projectId === projectId && timer.isRunning;
  }

  getCurrentTimer(): ActiveTimer | null {
    return this.activeTimerSubject.value;
  }

  private updateTimerDuration(): void {
    const currentTimer = this.activeTimerSubject.value;
    if (!currentTimer) return;

    const now = new Date();
    const durationMs = now.getTime() - currentTimer.startTime.getTime();
    const newDuration = this.formatDuration(durationMs);
    
    // Always emit a new object to ensure change detection
    const updatedTimer: ActiveTimer = {
      projectId: currentTimer.projectId,
      projectTitle: currentTimer.projectTitle,
      startTime: currentTimer.startTime,
      duration: newDuration,
      isRunning: currentTimer.isRunning
    };

    this.activeTimerSubject.next(updatedTimer);
  }

  private formatDuration(durationMs: number): string {
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Clean up when service is destroyed
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}