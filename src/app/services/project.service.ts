import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

  constructor(private http: HttpClient) {}

  getAllProjects(page: number = 1, limit: number = 10, status?: string): Observable<ProjectsResponse> {
    let params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) {
      params.append('status', status);
    }

    return this.http.get<ProjectsResponse>(`${this.apiUrl}?${params.toString()}`);
  }

  getProject(projectId: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.apiUrl}/${projectId}`);
  }

  createProject(projectData: CreateProjectData): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.apiUrl, projectData);
  }

  updateProject(projectId: string, projectData: Partial<CreateProjectData>): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.apiUrl}/${projectId}`, projectData);
  }

  deleteProject(projectId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${projectId}`);
  }

  completeProject(projectId: string): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.apiUrl}/${projectId}/complete`, {});
  }

  getProjectStats(): Observable<{ message: string; stats: ProjectStats }> {
    return this.http.get<{ message: string; stats: ProjectStats }>(`${this.apiUrl}/stats`);
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
