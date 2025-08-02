import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Project } from './project.service';

export interface TimeEntry {
  _id: string;
  projectId: string | Project;
  userId: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  description?: string;
  workLog?: string;
  date: string;
  isBreakTime: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  formattedDuration: string;
  earnings: number;
}

export interface CreateTimeEntryData {
  projectId: string;
  startTime: string;
  endTime: string;
  description?: string;
  workLog?: string;
  date?: string;
  tags?: string[];
}

export interface TimeEntryResponse {
  message: string;
  timeEntry: TimeEntry;
}

export interface TimeEntriesResponse {
  message: string;
  timeEntries: TimeEntry[];
  project?: {
    id: string;
    title: string;
    client: string;
  };
  pagination: {
    current: number;
    total: number;
    count: number;
    totalEntries: number;
  };
}

export interface TimeStats {
  totalHours: number;
  totalEarnings: number;
  entriesCount: number;
  avgHoursPerEntry: number;
}

export interface DailySummary {
  date: string;
  summary: {
    totalHours: number;
    totalEarnings: number;
    entriesCount: number;
  };
  timeEntries: TimeEntry[];
}

@Injectable({
  providedIn: 'root'
})
export class TimeEntryService {
  private apiUrl = `${environment.apiUrl}/time-entries`;

  constructor(private http: HttpClient) {}

  getAllTimeEntries(page: number = 1, limit: number = 20): Observable<TimeEntriesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return this.http.get<TimeEntriesResponse>(`${this.apiUrl}?${params.toString()}`);
  }

  getTimeEntriesForProject(projectId: string, page: number = 1, limit: number = 20): Observable<TimeEntriesResponse> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    return this.http.get<TimeEntriesResponse>(`${this.apiUrl}/project/${projectId}?${params.toString()}`);
  }

  createTimeEntry(timeEntryData: CreateTimeEntryData): Observable<TimeEntryResponse> {
    return this.http.post<TimeEntryResponse>(this.apiUrl, timeEntryData);
  }

  updateTimeEntry(timeEntryId: string, timeEntryData: Partial<CreateTimeEntryData>): Observable<TimeEntryResponse> {
    return this.http.put<TimeEntryResponse>(`${this.apiUrl}/${timeEntryId}`, timeEntryData);
  }

  deleteTimeEntry(timeEntryId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${timeEntryId}`);
  }

  getTimeStats(projectId?: string, period?: 'week' | 'month' | 'year'): Observable<{ message: string; stats: TimeStats; period: string }> {
    let params = new URLSearchParams();
    if (projectId) {
      params.append('projectId', projectId);
    }
    if (period) {
      params.append('period', period);
    }

    return this.http.get<{ message: string; stats: TimeStats; period: string }>(`${this.apiUrl}/stats?${params.toString()}`);
  }

  getDailySummary(date?: string): Observable<{ message: string } & DailySummary> {
    let params = new URLSearchParams();
    if (date) {
      params.append('date', date);
    }

    return this.http.get<{ message: string } & DailySummary>(`${this.apiUrl}/daily-summary?${params.toString()}`);
  }

  // Utility methods
  formatDuration(hours: number): string {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  }

  calculateHours(startTime: string, endTime: string): number {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  }

  formatTime(timeString: string): string {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  getCurrentTimeString(): string {
    return new Date().toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
  }
}
