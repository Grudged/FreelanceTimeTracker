import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { ProjectFormComponent } from '../project-form/project-form.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ThemeSelectorComponent, ProjectFormComponent],
  template: `
    <div class="projects-container">
      <!-- Navigation Header -->
      <nav class="navbar">
        <div class="nav-brand">
          <h1>Stack to the Future</h1>
          <div class="brand-logo" title="GG Logo"></div>
          <span class="tagline">Time Tracker</span>
        </div>
        
        <div class="nav-menu">
          <a routerLink="/dashboard" class="nav-link btn-link">Dashboard</a>
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

      <!-- Projects Content -->
      <main class="projects-main">
        <div class="projects-header">
          <div>
            <h2>Projects</h2>
            <p class="projects-subtitle">Manage and track all your freelance projects.</p>
          </div>
          <button (click)="openProjectForm()" class="btn btn-primary">
            <span class="icon">+</span>
            New Project
          </button>
        </div>

        <!-- Filters Section -->
        <div class="filters-section">
          <div class="filters-row">
            <div class="filter-group">
              <label for="statusFilter">Status</label>
              <select id="statusFilter" [(ngModel)]="filters.status" (ngModelChange)="applyFilters()" class="filter-select">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="clientFilter">Client</label>
              <select id="clientFilter" [(ngModel)]="filters.client" (ngModelChange)="applyFilters()" class="filter-select">
                <option value="">All Clients</option>
                <option *ngFor="let client of uniqueClients" [value]="client">{{ client }}</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="sortBy">Sort By</label>
              <select id="sortBy" [(ngModel)]="filters.sortBy" (ngModelChange)="applyFilters()" class="filter-select">
                <option value="updatedAt">Last Updated</option>
                <option value="createdAt">Date Created</option>
                <option value="title">Project Name</option>
                <option value="totalEarnings">Total Earnings</option>
                <option value="totalHoursWorked">Hours Worked</option>
              </select>
            </div>

            <div class="filter-group">
              <label for="sortOrder">Order</label>
              <select id="sortOrder" [(ngModel)]="filters.sortOrder" (ngModelChange)="applyFilters()" class="filter-select">
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>

            <button (click)="clearFilters()" class="btn btn-secondary">Clear Filters</button>
          </div>

          <div class="search-row">
            <div class="search-group">
              <input 
                type="text" 
                placeholder="Search projects..." 
                [(ngModel)]="filters.search"
                (ngModelChange)="applyFilters()"
                class="search-input"
              />
              <span class="search-icon">🔍</span>
            </div>
          </div>
        </div>

        <!-- Results Summary -->
        <div class="results-summary">
          <p>Showing {{ filteredProjects.length }} of {{ allProjects.length }} projects</p>
        </div>

        <!-- Projects Grid -->
        <div class="projects-grid" *ngIf="filteredProjects.length > 0; else noProjects">
          <div 
            class="project-card" 
            *ngFor="let project of filteredProjects"
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
            
            <div class="project-description" *ngIf="project.description">
              <p>{{ project.description }}</p>
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

            <div class="project-dates">
              <div class="date-info">
                <span class="date-label">Created:</span>
                <span class="date-value">{{ formatDate(project.createdAt) }}</span>
              </div>
              <div class="date-info" *ngIf="project.updatedAt !== project.createdAt">
                <span class="date-label">Updated:</span>
                <span class="date-value">{{ formatDate(project.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #noProjects>
          <div class="empty-state">
            <div class="empty-icon">📁</div>
            <h3>{{ getEmptyStateTitle() }}</h3>
            <p>{{ getEmptyStateMessage() }}</p>
            <button (click)="clearFilters()" class="btn btn-secondary" *ngIf="hasActiveFilters()">
              Clear Filters
            </button>
            <button (click)="openProjectForm()" class="btn btn-primary">
              Create Your First Project
            </button>
          </div>
        </ng-template>
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
    .projects-container {
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
      color: var(--color-text-primary, #f0fff0);
    }

    .profile-btn:hover {
      background: rgba(74, 124, 74, 0.2);
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
      color: var(--color-text-primary, #f0fff0);
      text-decoration: none;
      border: none;
      background: none;
      text-align: left;
      cursor: pointer;
      transition: background 0.3s ease;
    }

    .dropdown-item:hover {
      background: rgba(74, 124, 74, 0.2);
    }

    .logout-btn {
      color: #dc3545;
      border-top: 1px solid rgba(74, 124, 74, 0.3);
    }

    .projects-main {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .projects-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2rem;
    }

    .projects-header h2 {
      margin: 0 0 0.5rem 0;
      color: #f0fff0;
      font-size: 2rem;
      font-weight: 600;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .projects-subtitle {
      color: #c7d2c7;
      margin: 0;
      font-size: 1.1rem;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
    }

    .filters-section {
      background: rgba(74, 124, 74, 0.15);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(74, 124, 74, 0.4);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    }

    .filters-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 500;
      color: #e8f5e8;
      font-size: 0.875rem;
    }

    .filter-select {
      padding: 0.5rem;
      border: 2px solid rgba(74, 124, 74, 0.4);
      border-radius: 6px;
      background-color: rgba(45, 91, 45, 0.2);
      color: #e8f5e8;
      font-size: 0.875rem;
    }

    .filter-select:focus {
      outline: none;
      border-color: #4a7c4a;
      background-color: rgba(45, 91, 45, 0.3);
    }

    .search-row {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .search-group {
      position: relative;
      flex: 1;
      max-width: 400px;
    }

    .search-input {
      width: 100%;
      padding: 0.75rem 2.5rem 0.75rem 1rem;
      border: 2px solid rgba(74, 124, 74, 0.4);
      border-radius: 8px;
      background-color: rgba(45, 91, 45, 0.2);
      color: #e8f5e8;
      font-size: 1rem;
      box-sizing: border-box;
    }

    .search-input::placeholder {
      color: #a0c0a0;
    }

    .search-input:focus {
      outline: none;
      border-color: #4a7c4a;
      background-color: rgba(45, 91, 45, 0.3);
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #a0c0a0;
    }

    .results-summary {
      margin-bottom: 1.5rem;
    }

    .results-summary p {
      color: #c7d2c7;
      margin: 0;
      font-size: 0.875rem;
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

    .btn-secondary {
      background: rgba(74, 124, 74, 0.4);
      color: #e8f5e8;
      border: 2px solid rgba(74, 124, 74, 0.6);
    }

    .btn-secondary:hover {
      background: rgba(74, 124, 74, 0.6);
      border-color: #4a7c4a;
    }

    .icon {
      font-size: 1.2rem;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;
    }

    .project-card {
      background: rgba(74, 124, 74, 0.1);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(74, 124, 74, 0.4);
      border-radius: 12px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .project-card:hover {
      background: rgba(74, 124, 74, 0.2);
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
      color: #e8f5e8;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .project-client {
      margin: 0;
      color: #a0c0a0;
      font-size: 0.875rem;
    }

    .project-description {
      margin-bottom: 1rem;
    }

    .project-description p {
      margin: 0;
      color: #c7d2c7;
      font-size: 0.875rem;
      line-height: 1.4;
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

    .project-status.cancelled {
      background: #f8d7da;
      color: #721c24;
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
      color: #a0c0a0;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .project-stat .stat-value {
      font-size: 1rem;
      font-weight: 600;
      color: #e8f5e8;
      margin: 0;
    }

    .project-progress {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 6px;
      background: rgba(74, 124, 74, 0.3);
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
      color: #a0c0a0;
      font-weight: 500;
    }

    .project-dates {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #a0c0a0;
    }

    .date-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .date-label {
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .date-value {
      color: #c7d2c7;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background: rgba(74, 124, 74, 0.1);
      border-radius: 12px;
      border: 2px dashed rgba(74, 124, 74, 0.3);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #e8f5e8;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0 0 2rem 0;
      color: #a0c0a0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .empty-state .btn {
      margin: 0 0.5rem;
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

      .projects-main {
        padding: 1rem;
      }

      .projects-header {
        flex-direction: column;
        gap: 1rem;
        align-items: stretch;
      }

      .filters-row {
        grid-template-columns: 1fr;
      }

      .search-row {
        flex-direction: column;
        align-items: stretch;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .project-stats {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }

      .project-dates {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class ProjectsComponent implements OnInit {
  currentUser: any = null;
  showProfileMenu = false;
  showProjectForm = false;
  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  uniqueClients: string[] = [];
  isLoading = true;

  filters = {
    status: '',
    client: '',
    search: '',
    sortBy: 'updatedAt',
    sortOrder: 'desc'
  };

  constructor(
    private authService: AuthService,
    private projectService: ProjectService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadProjects();
  }

  loadProjects(): void {
    this.projectService.getAllProjects().subscribe({
      next: (response) => {
        this.allProjects = response.projects;
        this.filteredProjects = [...this.allProjects];
        this.extractUniqueClients();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
  }

  extractUniqueClients(): void {
    const clients = this.allProjects.map(project => project.client).filter(client => client);
    this.uniqueClients = [...new Set(clients)].sort();
  }

  applyFilters(): void {
    let filtered = [...this.allProjects];

    // Filter by status
    if (this.filters.status) {
      filtered = filtered.filter(project => project.status === this.filters.status);
    }

    // Filter by client
    if (this.filters.client) {
      filtered = filtered.filter(project => project.client === this.filters.client);
    }

    // Filter by search
    if (this.filters.search) {
      const searchTerm = this.filters.search.toLowerCase();
      filtered = filtered.filter(project => 
        project.title.toLowerCase().includes(searchTerm) ||
        project.client.toLowerCase().includes(searchTerm) ||
        (project.description && project.description.toLowerCase().includes(searchTerm))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any = a[this.filters.sortBy as keyof Project];
      let bValue: any = b[this.filters.sortBy as keyof Project];

      if (this.filters.sortBy === 'title') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return this.filters.sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return this.filters.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    this.filteredProjects = filtered;
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      client: '',
      search: '',
      sortBy: 'updatedAt',
      sortOrder: 'desc'
    };
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.status || this.filters.client || this.filters.search);
  }

  getEmptyStateTitle(): string {
    if (this.hasActiveFilters()) {
      return 'No projects match your filters';
    }
    return 'No projects yet';
  }

  getEmptyStateMessage(): string {
    if (this.hasActiveFilters()) {
      return 'Try adjusting your filters to see more projects.';
    }
    return 'Create your first project to start tracking time and managing your freelance work.';
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
    this.loadProjects(); // Refresh the projects list
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

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
