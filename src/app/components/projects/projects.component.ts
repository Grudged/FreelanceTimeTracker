import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService, Project } from '../../services/project.service';
import { AuthService } from '../../services/auth.service';
import { TimerService } from '../../services/timer.service';
import { ToastService } from '../../services/toast.service';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ThemeSelectorComponent, ProjectFormComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.css'
})
export class ProjectsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('earningsChart', { static: false }) earningsChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChart', { static: false }) statusChart!: ElementRef<HTMLCanvasElement>;
  
  currentUser: any = null;
  showProfileMenu = false;
  showProjectForm = false;
  allProjects: Project[] = [];
  filteredProjects: Project[] = [];
  uniqueClients: string[] = [];
  isLoading = true;
  
  // Chart instances
  earningsChartInstance: Chart | null = null;
  statusChartInstance: Chart | null = null;

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
    private timerService: TimerService,
    private toastService: ToastService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Register Chart.js components
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    console.log('ProjectsComponent ngOnInit called');
    
    // Subscribe to auth state changes
    this.authService.currentUser$.subscribe({
      next: (user) => {
        console.log('Auth state changed, user:', user);
        this.currentUser = user;
        this.cdr.detectChanges(); // Force change detection when auth state changes
        if (user && this.allProjects.length === 0) {
          console.log('User authenticated and no projects loaded yet, loading projects...');
          this.loadProjects();
        } else if (!user) {
          console.log('No user authenticated, redirecting to login...');
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Auth state error:', error);
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be initialized after projects are loaded
  }

  loadProjects(): void {
    console.log('loadProjects called, current isLoading:', this.isLoading);
    this.projectService.getAllProjects(1, 1000).subscribe({
      next: (response) => {
        console.log('Projects loaded from API:', response);
        console.log('Number of projects received:', response.projects.length);
        console.log('Projects array:', response.projects);
        this.allProjects = response.projects;
        console.log('allProjects set to:', this.allProjects.length);
        this.filteredProjects = [...this.allProjects];
        console.log('filteredProjects set to:', this.filteredProjects.length);
        this.extractUniqueClients();
        this.applyFilters();
        console.log('After applyFilters, filteredProjects:', this.filteredProjects.length);
        this.isLoading = false;
        console.log('isLoading set to false');
        
        // Force Angular to detect changes
        this.cdr.detectChanges();
        console.log('Change detection triggered');
        
        // Initialize charts after data is loaded
        setTimeout(() => {
          console.log('Initializing charts...');
          this.initializeCharts();
        }, 100);
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
    // Update charts when filters change
    this.updateCharts();
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

  // Chart methods
  initializeCharts(): void {
    if (this.earningsChart && this.statusChart) {
      this.createEarningsChart();
      this.createStatusChart();
    }
  }

  updateCharts(): void {
    if (this.earningsChartInstance) {
      this.updateEarningsChart();
    }
    if (this.statusChartInstance) {
      this.updateStatusChart();
    }
  }

  createEarningsChart(): void {
    const ctx = this.earningsChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const earningsData = this.getEarningsChartData();

    this.earningsChartInstance = new Chart(ctx, {
      type: 'bar',
      data: earningsData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(45, 62, 45, 0.9)',
            titleColor: '#e8f5e8',
            bodyColor: '#e8f5e8',
            borderColor: 'rgba(74, 124, 74, 0.8)',
            borderWidth: 1,
            callbacks: {
              label: (context) => {
                return `Earnings: $${context.parsed.y.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: '#a0c0a0',
              callback: (value) => '$' + value
            },
            grid: {
              color: 'rgba(74, 124, 74, 0.3)'
            }
          },
          x: {
            ticks: {
              color: '#a0c0a0',
              maxRotation: 45
            },
            grid: {
              color: 'rgba(74, 124, 74, 0.3)'
            }
          }
        }
      }
    });
  }

  createStatusChart(): void {
    const ctx = this.statusChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const statusData = this.getStatusChartData();

    this.statusChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: statusData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '#e8f5e8',
              padding: 20,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(45, 62, 45, 0.9)',
            titleColor: '#e8f5e8',
            bodyColor: '#e8f5e8',
            borderColor: 'rgba(74, 124, 74, 0.8)',
            borderWidth: 1
          }
        }
      }
    });
  }

  updateEarningsChart(): void {
    if (!this.earningsChartInstance) return;
    
    const earningsData = this.getEarningsChartData();
    this.earningsChartInstance.data = earningsData;
    this.earningsChartInstance.update();
  }

  updateStatusChart(): void {
    if (!this.statusChartInstance) return;
    
    const statusData = this.getStatusChartData();
    this.statusChartInstance.data = statusData;
    this.statusChartInstance.update();
  }

  getEarningsChartData(): any {
    // Get top 10 projects by earnings from filtered projects
    const topProjects = [...this.filteredProjects]
      .sort((a, b) => b.totalEarnings - a.totalEarnings)
      .slice(0, 10);

    return {
      labels: topProjects.map(project => project.title.length > 15 
        ? project.title.substring(0, 15) + '...' 
        : project.title),
      datasets: [{
        label: 'Earnings',
        data: topProjects.map(project => project.totalEarnings),
        backgroundColor: [
          'rgba(45, 91, 45, 0.8)',
          'rgba(74, 124, 74, 0.8)',
          'rgba(102, 126, 234, 0.8)',
          'rgba(40, 167, 69, 0.8)',
          'rgba(32, 201, 151, 0.8)',
          'rgba(255, 193, 7, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(108, 117, 125, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(111, 66, 193, 0.8)'
        ],
        borderColor: [
          'rgba(45, 91, 45, 1)',
          'rgba(74, 124, 74, 1)',
          'rgba(102, 126, 234, 1)',
          'rgba(40, 167, 69, 1)',
          'rgba(32, 201, 151, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(220, 53, 69, 1)',
          'rgba(108, 117, 125, 1)',
          'rgba(23, 162, 184, 1)',
          'rgba(111, 66, 193, 1)'
        ],
        borderWidth: 2
      }]
    };
  }

  getStatusChartData(): any {
    const statusCounts = this.filteredProjects.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const labels = Object.keys(statusCounts);
    const data = Object.values(statusCounts);

    const colors = {
      'active': 'rgba(40, 167, 69, 0.8)',
      'completed': 'rgba(102, 126, 234, 0.8)',
      'paused': 'rgba(255, 193, 7, 0.8)',
      'cancelled': 'rgba(220, 53, 69, 0.8)'
    };

    return {
      labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
      datasets: [{
        data: data,
        backgroundColor: labels.map(label => colors[label as keyof typeof colors] || 'rgba(108, 117, 125, 0.8)'),
        borderColor: labels.map(label => colors[label as keyof typeof colors]?.replace('0.8', '1') || 'rgba(108, 117, 125, 1)'),
        borderWidth: 2
      }]
    };
  }

  // Timer methods
  isTimerRunning(projectId: string): boolean {
    return this.timerService.isTimerRunning(projectId);
  }

  startTimer(projectId: string, projectTitle: string): void {
    const success = this.timerService.startTimer(projectId, projectTitle);
    if (success) {
      console.log(`Timer started for project: ${projectTitle}`);
      // Force change detection to update UI
      this.cdr.detectChanges();
      this.toastService.success(
        'Timer started! ⏱️',
        `Now tracking time for "${projectTitle}"`,
        3000
      );
    }
  }

  async stopTimer(): Promise<void> {
    try {
      const result = await this.timerService.stopTimer();
      if (result && result.success) {
        // Refresh projects data to show updated totals
        this.loadProjects();
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

  ngOnDestroy(): void {
    // Clean up chart instances
    if (this.earningsChartInstance) {
      this.earningsChartInstance.destroy();
    }
    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
    }
  }
}
