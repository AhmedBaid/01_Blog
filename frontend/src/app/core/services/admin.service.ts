import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PostAdmin, ReportAdmin, Stats, UserAdmin } from '../../models/models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';
  private http = inject(HttpClient);

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/stats`);
  }

  getUsers(): Observable<UserAdmin[]> {
    return this.http.get<UserAdmin[]>(`${this.apiUrl}/users`);
  }

  toggleBanUser(userId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/${userId}/ban`, {});
  }

  deleteUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${userId}`);
  }

  getPosts(): Observable<PostAdmin[]> {
    return this.http.get<PostAdmin[]>(`${this.apiUrl}/posts`);
  }

  toggleHidePost(postId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/posts/${postId}/hide`, {});
  }

  deletePost(postId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/posts/${postId}`);
  }

  getReports(): Observable<ReportAdmin[]> {
    return this.http.get<ReportAdmin[]>(`${this.apiUrl}/reports`);
  }

  reviewReport(reportId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reports/${reportId}/review`, {});
  }

  dismissReport(reportId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reports/${reportId}/dismiss`, {});
  }
}
