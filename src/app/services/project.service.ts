import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Project {
  _id: string;
  title: string;
  client: string;
  description?: string;
  isContract: boolean;
  hourlyRate: number;
  currency: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  endDate?: string;
  estimatedHours?: number;
  totalHoursWorked: number;
  totalEarnings: number;
  userId: string;
  tags: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
  formattedEarnings: string;
  projectDuration: number;
}

export interface CreateProjectData {
  title: string;
  client: string;
  description?: string;
  isContract?: boolean;
  hourlyRate: number;
  currency?: string;
  estimatedHours?: number;
  tags?: string[];
  notes?: string;
}

export interface ProjectResponse {
  message: string;
  project: Project;
  recentTimeEntries?: any[];
}

export interface ProjectsResponse {
  message: string;
  projects: Project[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalProjects: number;
  };
}

export interface ProjectStats {
  total: number;
  active: number;
  completed: number;
  paused: number;
  totalHours: number;
  totalEarnings: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private apiUrl = `${environment.apiUrl}/projects`;

  // Dummy data for development
  private dummyProjects: Project[] = [
    {
      _id: '1',
      title: 'E-commerce Website Redesign',
      client: 'TechCorp Solutions',
      description: 'Complete overhaul of the existing e-commerce platform with modern UI/UX',
      isContract: true,
      hourlyRate: 85,
      currency: 'USD',
      status: 'active',
      startDate: '2024-12-01',
      estimatedHours: 120,
      totalHoursWorked: 45.5,
      totalEarnings: 3867.50,
      userId: 'user1',
      tags: ['Angular', 'TypeScript', 'UI/UX', 'E-commerce'],
      notes: 'Client prefers weekly progress updates',
      createdAt: '2024-12-01T10:00:00Z',
      updatedAt: '2024-12-15T14:30:00Z',
      formattedEarnings: '$3,867.50',
      projectDuration: 14
    },
    {
      _id: '2',
      title: 'Mobile App Development',
      client: 'StartupXYZ',
      description: 'Cross-platform mobile application for fitness tracking',
      isContract: false,
      hourlyRate: 75,
      currency: 'USD',
      status: 'active',
      startDate: '2024-11-15',
      estimatedHours: 200,
      totalHoursWorked: 78.25,
      totalEarnings: 5868.75,
      userId: 'user1',
      tags: ['React Native', 'Mobile', 'API Integration', 'Firebase'],
      notes: 'MVP focus for first release',
      createdAt: '2024-11-15T09:00:00Z',
      updatedAt: '2024-12-14T16:45:00Z',
      formattedEarnings: '$5,868.75',
      projectDuration: 29
    },
    {
      _id: '3',
      title: 'CRM System Integration',
      client: 'Enterprise Inc',
      description: 'Integration of existing CRM with new accounting software',
      isContract: true,
      hourlyRate: 95,
      currency: 'USD',
      status: 'active',
      startDate: '2024-12-10',
      estimatedHours: 80,
      totalHoursWorked: 12.5,
      totalEarnings: 1187.50,
      userId: 'user1',
      tags: ['Integration', 'API', 'CRM', 'Backend'],
      notes: 'Requires security clearance documentation',
      createdAt: '2024-12-10T11:00:00Z',
      updatedAt: '2024-12-13T10:15:00Z',
      formattedEarnings: '$1,187.50',
      projectDuration: 5
    },
    {
      _id: '4',
      title: 'Website Performance Optimization',
      client: 'GreenTech Solutions',
      description: 'Optimize loading times and improve SEO for corporate website',
      isContract: true,
      hourlyRate: 70,
      currency: 'USD',
      status: 'completed',
      startDate: '2024-10-01',
      endDate: '2024-11-30',
      estimatedHours: 60,
      totalHoursWorked: 58.75,
      totalEarnings: 4112.50,
      userId: 'user1',
      tags: ['Performance', 'SEO', 'Web Optimization', 'Analytics'],
      notes: 'Successfully improved page load times by 40%',
      createdAt: '2024-10-01T08:00:00Z',
      updatedAt: '2024-11-30T17:00:00Z',
      formattedEarnings: '$4,112.50',
      projectDuration: 60
    },
    {
      _id: '5',
      title: 'Database Migration Project',
      client: 'DataFlow Corp',
      description: 'Migrate legacy database to modern cloud solution',
      isContract: false,
      hourlyRate: 90,
      currency: 'USD',
      status: 'paused',
      startDate: '2024-11-20',
      estimatedHours: 100,
      totalHoursWorked: 25.0,
      totalEarnings: 2250.00,
      userId: 'user1',
      tags: ['Database', 'Migration', 'Cloud', 'SQL'],
      notes: 'Paused pending client infrastructure setup',
      createdAt: '2024-11-20T13:00:00Z',
      updatedAt: '2024-12-05T09:30:00Z',
      formattedEarnings: '$2,250.00',
      projectDuration: 24
    },
    {
      _id: '6',
      title: 'API Documentation Portal',
      client: 'DevTools Inc',
      description: 'Create comprehensive API documentation and developer portal',
      isContract: true,
      hourlyRate: 65,
      currency: 'USD',
      status: 'completed',
      startDate: '2024-09-15',
      endDate: '2024-10-20',
      estimatedHours: 45,
      totalHoursWorked: 43.5,
      totalEarnings: 2827.50,
      userId: 'user1',
      tags: ['Documentation', 'API', 'Portal', 'Technical Writing'],
      notes: 'Received excellent feedback from development team',
      createdAt: '2024-09-15T10:00:00Z',
      updatedAt: '2024-10-20T15:00:00Z',
      formattedEarnings: '$2,827.50',
      projectDuration: 35
    }
  ];

  private dummyStats: ProjectStats = {
    total: 6,
    active: 3,
    completed: 2,
    paused: 1,
    totalHours: 263.5,
    totalEarnings: 20113.75
  };

  constructor(private http: HttpClient) {}

  getAllProjects(page: number = 1, limit: number = 10, status?: string): Observable<ProjectsResponse> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    console.log('Making API call to:', url);
    return this.http.get<ProjectsResponse>(url);
  }

  getProject(projectId: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${projectId}`);
  }

  createProject(projectData: CreateProjectData): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.apiUrl, projectData);
  }

  updateProject(projectId: string, projectData: Partial<CreateProjectData>): Observable<ProjectResponse> {
    const projectIndex = this.dummyProjects.findIndex(p => p._id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...this.dummyProjects[projectIndex],
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    this.dummyProjects[projectIndex] = updatedProject;

    const response: ProjectResponse = {
      message: 'Project updated successfully',
      project: updatedProject
    };

    return of(response);
  }

  deleteProject(projectId: string): Observable<{ message: string }> {
    const projectIndex = this.dummyProjects.findIndex(p => p._id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    this.dummyProjects.splice(projectIndex, 1);

    return of({ message: 'Project deleted successfully' });
  }

  completeProject(projectId: string): Observable<ProjectResponse> {
    const projectIndex = this.dummyProjects.findIndex(p => p._id === projectId);
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    const updatedProject = {
      ...this.dummyProjects[projectIndex],
      status: 'completed' as const,
      endDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    };

    this.dummyProjects[projectIndex] = updatedProject;

    const response: ProjectResponse = {
      message: 'Project completed successfully',
      project: updatedProject
    };

    return of(response);
  }

  getProjectStats(): Observable<{ message: string; stats: ProjectStats }> {
    // Recalculate stats from current dummy data
    const stats: ProjectStats = {
      total: this.dummyProjects.length,
      active: this.dummyProjects.filter(p => p.status === 'active').length,
      completed: this.dummyProjects.filter(p => p.status === 'completed').length,
      paused: this.dummyProjects.filter(p => p.status === 'paused').length,
      totalHours: this.dummyProjects.reduce((sum, p) => sum + p.totalHoursWorked, 0),
      totalEarnings: this.dummyProjects.reduce((sum, p) => sum + p.totalEarnings, 0)
    };

    return of({
      message: 'Project stats retrieved successfully',
      stats: stats
    });
  }

  // Utility methods
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  calculateProjectProgress(project: Project): number {
    if (!project.estimatedHours || project.estimatedHours === 0) {
      return 0;
    }
    return Math.min((project.totalHoursWorked / project.estimatedHours) * 100, 100);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'primary';
      case 'paused':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }
}
