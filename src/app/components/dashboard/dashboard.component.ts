import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ProjectService, Project, ProjectStats } from '../../services/project.service';
import { TimeEntryService, TimeStats } from '../../services/time-entry.service';
import { TimerService } from '../../services/timer.service';
import { ToastService } from '../../services/toast.service';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeSelectorComponent, ProjectFormComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showProfileMenu = false;
  showProjectForm = false;
  projectStats: ProjectStats | null = null;
  weeklyStats: TimeStats | null = null;
  recentProjects: Project[] = [];
  isLoading = true;
  

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private timeEntryService: TimeEntryService,
    private timerService: TimerService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
        this.cdr.detectChanges(); // Force change detection when auth state changes
        if (user) {
          this.loadDashboardData();
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Auth state error:', error);
      }
    });
  }

  loadDashboardData(): void {
    // Load project statistics
    this.projectService.getProjectStats().subscribe({
      next: (response) => {
        this.projectStats = response.stats;
      },
      error: (error) => {
        console.error('Error loading project stats:', error);
      }
    });

    // Load weekly time statistics
    this.timeEntryService.getTimeStats(undefined, 'week').subscribe({
      next: (response) => {
        this.weeklyStats = response.stats;
      },
      error: (error) => {
        console.error('Error loading time stats:', error);
      }
    });

    // Load recent active projects
    this.projectService.getAllProjects(1, 6, 'active').subscribe({
      next: (response) => {
        this.recentProjects = response.projects;
        this.isLoading = false;
        // Force Angular to detect changes
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  getInitials(): string {
    const user = this.currentUser;
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.username ? user.username[0].toUpperCase() : 'U';
  }

  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  openProjectForm(): void {
    this.showProjectForm = true;
  }

  onProjectFormClosed(): void {
    this.showProjectForm = false;
  }

  onProjectCreated(project: any): void {
    console.log('New project created:', project);
    // Refresh the projects list
    this.loadDashboardData();
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }

  getStatusClass(status: string): string {
    return status.toLowerCase();
  }

  getProjectProgress(project: Project): number {
    if (!project.estimatedHours || project.estimatedHours === 0) {
      return 0;
    }
    return Math.min((project.totalHoursWorked / project.estimatedHours) * 100, 100);
  }

  getAvgHourlyRate(): string {
    if (!this.weeklyStats?.totalHours || !this.weeklyStats?.totalEarnings) {
      return '0';
    }
    const avgRate = this.weeklyStats.totalEarnings / this.weeklyStats.totalHours;
    return avgRate.toFixed(0);
  }

  // Timer methods
  isTimerRunning(projectId: string): boolean {
    return this.timerService.isTimerRunning(projectId);
  }

  startTimer(projectId: string, projectTitle: string): void {
    // Find the project to get detailed info
    const project = this.recentProjects.find(p => p._id === projectId);
    const success = this.timerService.startTimer(projectId, projectTitle, project);
    
    if (success) {
      // Refresh dashboard data after starting timer
      this.loadDashboardData();
      const hourlyRate = project?.hourlyRate || 75;
      this.toastService.success(
        'Timer started! ⏱️',
        `Now tracking "${projectTitle}" at $${hourlyRate}/hr`,
        3000
      );
    }
  }

  async stopTimer(projectId: string): Promise<void> {
    try {
      const result = await this.timerService.stopTimer();
      if (result && result.success) {
        // Refresh dashboard data to show updated totals
        this.loadDashboardData();
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

  getTimerDuration(projectId: string): string {
    const timer = this.timerService.getCurrentTimer();
    if (timer && timer.projectId === projectId) {
      return timer.duration;
    }
    return '00:00:00';
  }

  // Test method to see toasts in action (you can remove this later)
  testToast(): void {
    this.toastService.success(
      'Test Toast Success! 🎉',
      'This is a beautiful themed toast notification that matches your design!',
      5000
    );
    
    // Show different types after delays for demo
    setTimeout(() => {
      this.toastService.info(
        'Info Toast 💡',
        'Here\'s some helpful information for you.',
        4000
      );
    }, 1000);
    
    setTimeout(() => {
      this.toastService.warning(
        'Warning Toast ⚠️',
        'This is a warning message to grab your attention.',
        4000
      );
    }, 2000);
  }

  ngOnDestroy(): void {
    // Timer cleanup is now handled by the TimerService
    // No need to clean up here since timers persist across components
  }
}
