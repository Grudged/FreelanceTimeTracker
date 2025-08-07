import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ProjectService, Project, ProjectStats } from '../../services/project.service';
import { TimeEntryService, TimeStats } from '../../services/time-entry.service';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ThemeSelectorComponent, ProjectFormComponent],
  template: `
    <div class="dashboard-container">
      <!-- Navigation Header -->
      <nav class="navbar">
        <div class="nav-brand">
          <h1>Stack to the Future</h1>
          <div class="brand-logo" title="GG Logo"></div>
          <span class="tagline">Time Tracker</span>
        </div>
        
        <div class="nav-menu">
          <a routerLink="/projects" class="nav-link btn-link">Projects</a>
          <button (click)="openProjectForm(); $event.preventDefault()" class="nav-link btn-outline">New Project</button>
          
          <app-theme-selector></app-theme-selector>
          
          <div class="profile-dropdown">
            <button class="profile-btn" (click)="toggleProfileMenu()">
              <span>{{ currentUser?.firstName || currentUser?.username }}</span>
              <span class="avatar">
                {{ getInitials() }}
              </span>
            </button>
            
            <div class="dropdown-menu" [class.active]="showProfileMenu">
              <a routerLink="/profile" class="dropdown-item">Profile</a>
              <button (click)="logout()" class="dropdown-item logout-btn">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Dashboard Content -->
      <main class="dashboard-main">
        <div class="dashboard-header">
          <div>
            <h2>Welcome back, {{ currentUser?.firstName || currentUser?.username }}!</h2>
            <p class="dashboard-subtitle">Here's what's happening with your projects today.</p>
          </div>
          <!---<button (click)="openProjectForm(); $event.preventDefault()" class="btn btn-primary">New Project</button>--->
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-header">
              <h3>Active Projects</h3>
              <span class="stat-icon projects">📁</span>
            </div>
            <div class="stat-value">{{ projectStats?.active || 0 }}</div>
            <div class="stat-change positive">{{ projectStats?.total || 0 }} total</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <h3>Hours This Week</h3>
              <span class="stat-icon time">⏰</span>
            </div>
            <div class="stat-value">{{ weeklyStats?.totalHours?.toFixed(1) || '0.0' }}</div>
            <div class="stat-change">{{ weeklyStats?.entriesCount || 0 }} entries</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <h3>Weekly Earnings</h3>
              <span class="stat-icon earnings">💰</span>
            </div>
            <div class="stat-value">\${{ weeklyStats?.totalEarnings?.toFixed(0) || '0' }}</div>
            <div class="stat-change">~\${{ getAvgHourlyRate() }}/hr avg</div>
          </div>

          <div class="stat-card">
            <div class="stat-header">
              <h3>Completed Projects</h3>
              <span class="stat-icon completed">✅</span>
            </div>
            <div class="stat-value">{{ projectStats?.completed || 0 }}</div>
            <div class="stat-change">All time</div>
          </div>
        </div>

        <!-- Recent Projects -->
        <div class="dashboard-section">
          <div class="section-header">
            <h3>Active Projects</h3>
            <a routerLink="/projects" class="view-all-link">View All</a>
          </div>
          
          <div class="projects-grid" *ngIf="recentProjects.length > 0; else noProjects">
            <div 
              class="project-card" 
              *ngFor="let project of recentProjects"
              (click)="navigateToProject(project._id)"
            >
              <div class="project-header">
                <div>
                  <h4>{{ project.title }}</h4>
                  <p class="project-client">{{ project.client }}</p>
                </div>
                <span class="project-status" [class]="getStatusClass(project.status)">
                  {{ project.status }}
                </span>
              </div>
              
              <div class="project-stats">
                <div class="project-stat">
                  <span class="stat-label">Hours</span>
                  <span class="stat-value">{{ project.totalHoursWorked.toFixed(1) }}</span>
                </div>
                <div class="project-stat">
                  <span class="stat-label">Rate</span>
                  <span class="stat-value">\${{ project.hourlyRate }}/hr</span>
                </div>
                <div class="project-stat">
                  <span class="stat-label">Earned</span>
                  <span class="stat-value">\${{ project.totalEarnings.toFixed(0) }}</span>
                </div>
              </div>
              
              <div class="project-progress" *ngIf="project.estimatedHours">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    [style.width.%]="getProjectProgress(project)"
                  ></div>
                </div>
                <span class="progress-text">
                  {{ getProjectProgress(project).toFixed(0) }}% complete
                </span>
              </div>

              <!-- Time Tracking Controls -->
              <div class="time-tracking-controls">
                <button 
                  *ngIf="!isTimerRunning(project._id)"
                  (click)="startTimer(project._id, project.title); $event.stopPropagation()"
                  class="btn-timer btn-start"
                  title="Start timer for {{ project.title }}"
                >
                  <span class="timer-icon">▶️</span>
                  Start Work
                </button>
                
                <button 
                  *ngIf="isTimerRunning(project._id)"
                  (click)="stopTimer(project._id); $event.stopPropagation()"
                  class="btn-timer btn-stop"
                  title="Stop timer for {{ project.title }}"
                >
                  <span class="timer-icon">⏸️</span>
                  Stop Work
                  <span class="timer-duration">{{ getTimerDuration(project._id) }}</span>
                </button>
              </div>
            </div>
          </div>

          <ng-template #noProjects>
            <div class="empty-state">
              <div class="empty-icon">📁</div>
              <h3>No active projects yet</h3>
              <p>Create your first project to start tracking time and managing your freelance work.</p>
              <button (click)="openProjectForm()" class="btn btn-primary">
                Create Your First Project
              </button>
            </div>
          </ng-template>
        </div>
      </main>
      
      <!-- Project Form Modal -->
      <app-project-form 
        *ngIf="showProjectForm"
        (formClosed)="onProjectFormClosed()"
        (projectCreated)="onProjectCreated($event)"
      ></app-project-form>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: var(--color-background, linear-gradient(135deg, #1a2e1a 0%, #2d3b2d 50%, #3d4f3d 100%));
    }

    .navbar {
      background: var(--color-surface, linear-gradient(145deg, rgba(61, 79, 61, 0.9) 0%, rgba(45, 62, 45, 0.9) 100%));
      border-bottom: 1px solid var(--color-border, rgba(74, 124, 74, 0.3));
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .nav-brand h1 {
      margin: 0;
      color: var(--color-accent, #8eb68e);
      font-size: 1.5rem;
      font-weight: 700;
    }

    .brand-logo {
      height: 50px;
      width: 50px;
      background-image: url('/GGLogo.png');
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      display: inline-block;
      flex-shrink: 0;
    }

    .tagline {
      color: var(--color-text-muted, #666);
      font-size: 0.875rem;
      font-weight: 400;
    }

    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .nav-link {
      color: var(--color-text-muted, #666);
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      transition: all 0.3s ease;
      background: none;
      border: none;
      cursor: pointer;
    }

    .nav-link:hover {
      color: var(--color-accent-hover, #a6d4a6);
      background: var(--color-border-light, rgba(74, 124, 74, 0.2));
    }

    .btn-link {
      background: none !important;
      border: none !important;
    }

    .btn-outline {
      border: 2px solid var(--color-primary-light, #4a7c4a);
      color: var(--color-primary-light, #4a7c4a);
    }

    .btn-outline:hover {
      background: var(--color-primary-light, #4a7c4a);
      color: var(--color-text-primary, #f0fff0);
    }

    .profile-dropdown {
      position: relative;
    }

    .profile-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: none;
      border: none;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: background 0.3s ease;
    }

    .profile-btn:hover {
      background: #f8f9fa;
    }

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .dropdown-menu {
      position: absolute;
      top: 100%;
      right: 0;
      background: linear-gradient(145deg, rgba(61, 79, 61, 0.95) 0%, rgba(45, 62, 45, 0.95) 100%);
      border: 1px solid rgba(74, 124, 74, 0.3);
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
      backdrop-filter: blur(10px);
      min-width: 150px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 1000;
    }

    .dropdown-menu.active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .dropdown-item {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      color: #333;
      text-decoration: none;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .dropdown-item:hover {
      background: #f8f9fa;
    }

    .logout-btn {
      color: #dc3545;
      border-top: 1px solid #e1e5e9;
    }

    .dashboard-main {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .dashboard-header h2 {
      margin: 0 0 0.5rem 0;
      color: #f0fff0;
      font-size: 2rem;
      font-weight: 600;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .dashboard-subtitle {
      color: #c7d2c7;
      margin: 0;
      font-size: 1.1rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary {
      background: #667eea;
      color: white;
    }

    .btn-primary:hover {
      background: #5a6fd8;
      transform: translateY(-1px);
    }

    .icon {
      font-size: 1.2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: rgba(74, 124, 74, 0.2) !important;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(74, 124, 74, 0.5) !important;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(0,0,0,0.3);
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(74, 124, 74, 0.4);
    }

    .stat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .stat-header h3 {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .stat-change {
      font-size: 0.875rem;
      color: #666;
    }

    .stat-change.positive {
      color: #28a745;
    }

    .dashboard-section {
      background: rgba(74, 124, 74, 0.15) !important;
      backdrop-filter: blur(10px);
      border: 2px solid rgba(74, 124, 74, 0.4) !important;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .view-all-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .view-all-link:hover {
      text-decoration: underline;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .project-card {
      background: rgba(74, 124, 74, 0.1) !important;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(74, 124, 74, 0.4) !important;
      border-radius: 8px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .project-card:hover {
      background: rgba(255, 255, 255, 0.9);
      border-color: #4a7c4a;
      box-shadow: 0 6px 20px rgba(74, 124, 74, 0.3);
      transform: translateY(-2px);
    }

    .project-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .project-header h4 {
      margin: 0 0 0.25rem 0;
      color: #333;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .project-client {
      margin: 0;
      color: #666;
      font-size: 0.875rem;
    }

    .project-status {
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .project-status.active {
      background: #d4edda;
      color: #155724;
    }

    .project-status.completed {
      background: #cce5ff;
      color: #004085;
    }

    .project-status.paused {
      background: #fff3cd;
      color: #856404;
    }

    .project-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .project-stat {
      text-align: center;
    }

    .stat-label {
      display: block;
      font-size: 0.75rem;
      color: #666;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .project-stat .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    .project-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: #e1e5e9;
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: #667eea;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.875rem;
      color: #666;
      font-weight: 500;
    }

    .time-tracking-controls {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
    }

    .btn-timer {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 6px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      min-width: 100px;
      justify-content: center;
    }

    .btn-start {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
    }

    .btn-start:hover {
      background: linear-gradient(135deg, #218838 0%, #1ea085 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
    }

    .btn-stop {
      background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
      color: white;
      box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
      animation: pulse 2s infinite;
    }

    .btn-stop:hover {
      background: linear-gradient(135deg, #c82333 0%, #e8590c 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    }

    .timer-icon {
      font-size: 1rem;
    }

    .timer-duration {
      font-size: 0.75rem;
      font-weight: 500;
      background: rgba(255, 255, 255, 0.2);
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
      margin-left: 0.25rem;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
      }
      50% {
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.6);
      }
      100% {
        box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
      color: #666;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .nav-menu {
        justify-content: space-between;
      }

      .dashboard-main {
        padding: 1rem;
      }

      .dashboard-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .project-stats {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .btn-timer {
        min-width: 80px;
        padding: 0.375rem 0.75rem;
        font-size: 0.8rem;
      }

      .timer-duration {
        font-size: 0.7rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  showProfileMenu = false;
  showProjectForm = false;
  projectStats: ProjectStats | null = null;
  weeklyStats: TimeStats | null = null;
  recentProjects: Project[] = [];
  isLoading = true;
  
  // Timer properties
  activeTimers: Map<string, { startTime: Date; intervalId: any }> = new Map();
  timerDisplay: Map<string, string> = new Map();

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private timeEntryService: TimeEntryService,
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
    return this.activeTimers.has(projectId);
  }

  startTimer(projectId: string, projectTitle: string): void {
    if (this.activeTimers.has(projectId)) {
      return; // Timer already running
    }

    const startTime = new Date();
    const intervalId = setInterval(() => {
      this.updateTimerDisplay(projectId, startTime);
    }, 1000);

    this.activeTimers.set(projectId, { startTime, intervalId });
    this.updateTimerDisplay(projectId, startTime);
    
    console.log(`Timer started for project: ${projectTitle}`);
    // TODO: You might want to save this to the backend or local storage
  }

  stopTimer(projectId: string): void {
    const timer = this.activeTimers.get(projectId);
    if (!timer) {
      return;
    }

    // Clear the interval
    clearInterval(timer.intervalId);
    
    // Calculate duration
    const endTime = new Date();
    const durationMs = endTime.getTime() - timer.startTime.getTime();
    const durationHours = durationMs / (1000 * 60 * 60); // Convert to hours

    // Remove from active timers
    this.activeTimers.delete(projectId);
    this.timerDisplay.delete(projectId);

    console.log(`Timer stopped for project ${projectId}. Duration: ${durationHours.toFixed(2)} hours`);
    
    // Create time entry
    const timeEntryData = {
      projectId: projectId,
      startTime: timer.startTime.toISOString(),
      endTime: endTime.toISOString(),
      description: 'Work session',
      workLog: 'Time tracked via dashboard timer'
    };

    this.timeEntryService.createTimeEntry(timeEntryData).subscribe({
      next: (response) => {
        console.log('Time entry created successfully:', response);
        
        // Refresh dashboard data to show updated totals
        this.loadDashboardData();
        
        // Show success message
        alert(`Work session completed! Duration: ${this.formatDuration(durationMs)}\nTime entry saved successfully.`);
      },
      error: (error) => {
        console.error('Error creating time entry:', error);
        alert(`Work session completed! Duration: ${this.formatDuration(durationMs)}\nError saving time entry: ${error.message || 'Unknown error'}`);
      }
    });
  }

  getTimerDuration(projectId: string): string {
    return this.timerDisplay.get(projectId) || '00:00:00';
  }

  private updateTimerDisplay(projectId: string, startTime: Date): void {
    const now = new Date();
    const durationMs = now.getTime() - startTime.getTime();
    this.timerDisplay.set(projectId, this.formatDuration(durationMs));
    // Trigger change detection to update the UI
    this.cdr.detectChanges();
  }

  private formatDuration(durationMs: number): string {
    const totalSeconds = Math.floor(durationMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    // Clean up any running timers when component is destroyed
    this.activeTimers.forEach((timer) => {
      clearInterval(timer.intervalId);
    });
    this.activeTimers.clear();
    this.timerDisplay.clear();
  }
}
