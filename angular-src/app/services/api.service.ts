import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  DashboardSummary, 
  Transaction, 
  JobFamily, 
  Reviewer, 
  Notification,
  PaginatedResponse 
} from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  // Dashboard endpoints
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.baseUrl}/dashboard/summary`);
  }

  getTransactions(page: number = 1, limit: number = 4): Observable<PaginatedResponse<Transaction>> {
    return this.http.get<PaginatedResponse<Transaction>>(`${this.baseUrl}/transactions`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getJobFamilies(page: number = 1, limit: number = 4): Observable<PaginatedResponse<JobFamily>> {
    return this.http.get<PaginatedResponse<JobFamily>>(`${this.baseUrl}/job-families`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  getReviewers(page: number = 1, limit: number = 4): Observable<PaginatedResponse<Reviewer>> {
    return this.http.get<PaginatedResponse<Reviewer>>(`${this.baseUrl}/reviewers`, {
      params: { page: page.toString(), limit: limit.toString() }
    });
  }

  // Notifications
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.baseUrl}/notifications`);
  }

  deleteNotification(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/notifications/${id}`);
  }

  markNotificationAsRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  // Database health
  getDatabaseHealth(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/health`);
  }
}