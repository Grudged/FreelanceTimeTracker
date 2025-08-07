import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TimeEntryService } from './time-entry.service';
import { ProjectService, Project } from './project.service';

export interface ActiveTimer {
  projectId: string;
  projectTitle: string;
  projectClient: string;
  hourlyRate: number;
  startTime: Date;
  duration: string;
  durationMs: number;
  hoursWorked: number;
  estimatedEarnings: number;
  isRunning: boolean;
  sessionBreaks: number;
  tags: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {
  private activeTimerSubject = new BehaviorSubject<ActiveTimer | null>(null);
  private intervalId: any = null;

  public activeTimer$ = this.activeTimerSubject.asObservable();

  constructor(
    private timeEntryService: TimeEntryService,
    private projectService: ProjectService
  ) {}

  startTimer(projectId: string, projectTitle: string, projectData?: Project): boolean {
    // Stop any existing timer first
    if (this.activeTimerSubject.value) {
      this.stopTimer();
    }

    const startTime = new Date();
    
    // If project data is provided, use it; otherwise, we'll fetch it or use defaults
    const hourlyRate = projectData?.hourlyRate || 75; // Default rate
    const projectClient = projectData?.client || 'Unknown Client';

    const timer: ActiveTimer = {
      projectId,
      projectTitle,
      projectClient,
      hourlyRate,
      startTime,
      duration: '00:00:00',
      durationMs: 0,
      hoursWorked: 0,
      estimatedEarnings: 0,
      isRunning: true,
      sessionBreaks: 0,
      tags: this.generateAutoTags()
    };

    this.activeTimerSubject.next(timer);
    
    // Start the interval to update duration
    this.intervalId = setInterval(() => {
      this.updateTimerDuration();
    }, 1000);

    console.log(`Timer started for project: ${projectTitle} (${projectClient}) at $${hourlyRate}/hr`);
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
      
      // Create detailed time entry with validation
      const timeEntryData = {
        projectId: currentTimer.projectId,
        startTime: currentTimer.startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: `Work session on ${currentTimer.projectTitle}`,
        workLog: `Time tracked via persistent timer. Client: ${currentTimer.projectClient}. ${currentTimer.sessionBreaks > 0 ? `Breaks taken: ${currentTimer.sessionBreaks}.` : ''}`,
        date: currentTimer.startTime.toISOString().split('T')[0],
        tags: currentTimer.tags || []
      };

      // Validate required fields
      if (!timeEntryData.projectId || !timeEntryData.startTime || !timeEntryData.endTime) {
        console.error('Invalid time entry data - missing required fields:', timeEntryData);
        reject({
          success: false,
          duration: this.formatDuration(durationMs),
          error: 'Invalid time entry data - missing required fields'
        });
        return;
      }

      console.log('Creating time entry with data:', timeEntryData);

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
          console.error('Time entry data that failed:', timeEntryData);
          console.error('Full error details:', {
            status: error.status,
            statusText: error.statusText,
            message: error.message,
            error: error.error
          });
          reject({
            success: false,
            duration: this.formatDuration(durationMs),
            error: error.error?.message || error.message || 'Unknown error'
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
    const hoursWorked = durationMs / (1000 * 60 * 60);
    const estimatedEarnings = hoursWorked * currentTimer.hourlyRate;
    
    // Always emit a new object to ensure change detection
    const updatedTimer: ActiveTimer = {
      projectId: currentTimer.projectId,
      projectTitle: currentTimer.projectTitle,
      projectClient: currentTimer.projectClient,
      hourlyRate: currentTimer.hourlyRate,
      startTime: currentTimer.startTime,
      duration: this.formatDuration(durationMs),
      durationMs,
      hoursWorked,
      estimatedEarnings,
      isRunning: currentTimer.isRunning,
      sessionBreaks: currentTimer.sessionBreaks,
      tags: currentTimer.tags
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

  // Add a break to the current session
  addBreak(): boolean {
    const currentTimer = this.activeTimerSubject.value;
    if (!currentTimer) return false;

    const updatedTimer = {
      ...currentTimer,
      sessionBreaks: currentTimer.sessionBreaks + 1
    };

    this.activeTimerSubject.next(updatedTimer);
    return true;
  }

  // Generate automatic tags based on time and day
  private generateAutoTags(): string[] {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    const tags = [dayOfWeek];
    
    // Add time-based tags
    if (hour < 12) {
      tags.push('Morning');
    } else if (hour < 17) {
      tags.push('Afternoon');
    } else {
      tags.push('Evening');
    }

    // Add productivity tags based on typical patterns
    if (hour >= 9 && hour <= 11) {
      tags.push('Peak Hours');
    }

    return tags;
  }

  // Get session statistics
  getSessionStats(): { duration: string; earnings: string; hourlyRate: number } | null {
    const timer = this.activeTimerSubject.value;
    if (!timer) return null;

    return {
      duration: timer.duration,
      earnings: `$${timer.estimatedEarnings.toFixed(2)}`,
      hourlyRate: timer.hourlyRate
    };
  }

  // Clean up when service is destroyed
  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}