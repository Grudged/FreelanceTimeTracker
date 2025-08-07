import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
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

  // Dummy time entries for development
  private dummyTimeEntries: TimeEntry[] = [
    {
      _id: '1',
      projectId: '1',
      userId: 'user1',
      startTime: '2024-12-15T09:00:00Z',
      endTime: '2024-12-15T13:30:00Z',
      hoursWorked: 4.5,
      description: 'Working on responsive design components',
      workLog: 'Implemented mobile navigation and grid layouts',
      date: '2024-12-15',
      isBreakTime: false,
      tags: ['Frontend', 'Responsive'],
      createdAt: '2024-12-15T09:00:00Z',
      updatedAt: '2024-12-15T13:30:00Z',
      formattedDuration: '4h 30m',
      earnings: 382.50
    },
    {
      _id: '2',
      projectId: '2',
      userId: 'user1',
      startTime: '2024-12-14T10:00:00Z',
      endTime: '2024-12-14T16:00:00Z',
      hoursWorked: 6.0,
      description: 'API integration for user authentication',
      workLog: 'Set up Firebase auth, implemented login/logout flows',
      date: '2024-12-14',
      isBreakTime: false,
      tags: ['Backend', 'Authentication'],
      createdAt: '2024-12-14T10:00:00Z',
      updatedAt: '2024-12-14T16:00:00Z',
      formattedDuration: '6h 0m',
      earnings: 450.00
    },
    {
      _id: '3',
      projectId: '1',
      userId: 'user1',
      startTime: '2024-12-13T14:00:00Z',
      endTime: '2024-12-13T18:00:00Z',
      hoursWorked: 4.0,
      description: 'Product catalog page development',
      workLog: 'Created product listing, filtering, and search functionality',
      date: '2024-12-13',
      isBreakTime: false,
      tags: ['Frontend', 'E-commerce'],
      createdAt: '2024-12-13T14:00:00Z',
      updatedAt: '2024-12-13T18:00:00Z',
      formattedDuration: '4h 0m',
      earnings: 340.00
    },
    {
      _id: '4',
      projectId: '3',
      userId: 'user1',
      startTime: '2024-12-12T09:30:00Z',
      endTime: '2024-12-12T13:00:00Z',
      hoursWorked: 3.5,
      description: 'CRM API analysis and documentation',
      workLog: 'Reviewed existing API endpoints, documented integration requirements',
      date: '2024-12-12',
      isBreakTime: false,
      tags: ['Documentation', 'API'],
      createdAt: '2024-12-12T09:30:00Z',
      updatedAt: '2024-12-12T13:00:00Z',
      formattedDuration: '3h 30m',
      earnings: 332.50
    },
    {
      _id: '5',
      projectId: '2',
      userId: 'user1',
      startTime: '2024-12-11T11:00:00Z',
      endTime: '2024-12-11T17:30:00Z',
      hoursWorked: 6.5,
      description: 'Fitness tracking UI components',
      workLog: 'Built workout logging screens, charts for progress tracking',
      date: '2024-12-11',
      isBreakTime: false,
      tags: ['UI/UX', 'Mobile'],
      createdAt: '2024-12-11T11:00:00Z',
      updatedAt: '2024-12-11T17:30:00Z',
      formattedDuration: '6h 30m',
      earnings: 487.50
    }
  ];

  // Dummy weekly stats
  private dummyWeeklyStats: TimeStats = {
    totalHours: 24.5,
    totalEarnings: 1992.50,
    entriesCount: 5,
    avgHoursPerEntry: 4.9
  };

  constructor(private http: HttpClient) {}

  getAllTimeEntries(page: number = 1, limit: number = 20): Observable<TimeEntriesResponse> {
    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = this.dummyTimeEntries.slice(startIndex, endIndex);

    const response: TimeEntriesResponse = {
      message: 'Time entries retrieved successfully',
      timeEntries: paginatedEntries,
      pagination: {
        current: page,
        total: Math.ceil(this.dummyTimeEntries.length / limit),
        count: paginatedEntries.length,
        totalEntries: this.dummyTimeEntries.length
      }
    };

    return of(response);
  }

  getTimeEntriesForProject(projectId: string, page: number = 1, limit: number = 20): Observable<TimeEntriesResponse> {
    const filteredEntries = this.dummyTimeEntries.filter(entry => entry.projectId === projectId);
    
    // Simulate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    const response: TimeEntriesResponse = {
      message: 'Time entries retrieved successfully',
      timeEntries: paginatedEntries,
      project: {
        id: projectId,
        title: 'Project Title', // You could enhance this by looking up actual project data
        client: 'Client Name'
      },
      pagination: {
        current: page,
        total: Math.ceil(filteredEntries.length / limit),
        count: paginatedEntries.length,
        totalEntries: filteredEntries.length
      }
    };

    return of(response);
  }

  createTimeEntry(timeEntryData: CreateTimeEntryData): Observable<TimeEntryResponse> {
    return this.http.post<TimeEntryResponse>(this.apiUrl, timeEntryData);
  }

  updateTimeEntry(timeEntryId: string, timeEntryData: Partial<CreateTimeEntryData>): Observable<TimeEntryResponse> {
    const entryIndex = this.dummyTimeEntries.findIndex(entry => entry._id === timeEntryId);
    if (entryIndex === -1) {
      throw new Error('Time entry not found');
    }

    const updatedEntry = {
      ...this.dummyTimeEntries[entryIndex],
      ...timeEntryData,
      updatedAt: new Date().toISOString()
    };

    // Recalculate hours if start/end time changed
    if (timeEntryData.startTime || timeEntryData.endTime) {
      updatedEntry.hoursWorked = this.calculateHours(updatedEntry.startTime, updatedEntry.endTime);
      updatedEntry.formattedDuration = this.formatDuration(updatedEntry.hoursWorked);
      updatedEntry.earnings = updatedEntry.hoursWorked * 75; // Recalculate earnings
    }

    this.dummyTimeEntries[entryIndex] = updatedEntry;

    const response: TimeEntryResponse = {
      message: 'Time entry updated successfully',
      timeEntry: updatedEntry
    };

    return of(response);
  }

  deleteTimeEntry(timeEntryId: string): Observable<{ message: string }> {
    const entryIndex = this.dummyTimeEntries.findIndex(entry => entry._id === timeEntryId);
    if (entryIndex === -1) {
      throw new Error('Time entry not found');
    }

    this.dummyTimeEntries.splice(entryIndex, 1);

    return of({ message: 'Time entry deleted successfully' });
  }

  getTimeStats(projectId?: string, period?: 'week' | 'month' | 'year'): Observable<{ message: string; stats: TimeStats; period: string }> {
    let filteredEntries = this.dummyTimeEntries;
    
    if (projectId) {
      filteredEntries = this.dummyTimeEntries.filter(entry => entry.projectId === projectId);
    }

    // For simplicity, returning weekly stats regardless of period
    // In a real implementation, you'd filter by actual date ranges
    const stats: TimeStats = {
      totalHours: filteredEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0),
      totalEarnings: filteredEntries.reduce((sum, entry) => sum + entry.earnings, 0),
      entriesCount: filteredEntries.length,
      avgHoursPerEntry: filteredEntries.length > 0 ? 
        filteredEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0) / filteredEntries.length : 0
    };

    return of({
      message: 'Time stats retrieved successfully',
      stats: period === 'week' ? this.dummyWeeklyStats : stats,
      period: period || 'week'
    });
  }

  getDailySummary(date?: string): Observable<{ message: string } & DailySummary> {
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dayEntries = this.dummyTimeEntries.filter(entry => entry.date === targetDate);

    const summary = {
      totalHours: dayEntries.reduce((sum, entry) => sum + entry.hoursWorked, 0),
      totalEarnings: dayEntries.reduce((sum, entry) => sum + entry.earnings, 0),
      entriesCount: dayEntries.length
    };

    const response = {
      message: 'Daily summary retrieved successfully',
      date: targetDate,
      summary: summary,
      timeEntries: dayEntries
    };

    return of(response);
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
