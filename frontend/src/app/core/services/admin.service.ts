import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { PostsAdminPage, ReportsPage, Stats, UsersPage } from '../../models/models';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';
  private http = inject(HttpClient);

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/stats`);
  }

  getUsers(page: number, search?: string, size?: number): Observable<UsersPage> {
    let params = new HttpParams().set('page', page.toString());
    if (search) params = params.set('search', search);
    if (size) params = params.set('size', size.toString());
    return this.http.get<UsersPage>(`${this.apiUrl}/users`, { params });
  }

  toggleBanUser(userId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/users/${userId}/ban`, {});
  }

  deleteUser(userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/users/${userId}`);
  }

  getPosts(page: number, search?: string): Observable<PostsAdminPage> {
    let params = new HttpParams().set('page', page.toString());
    if (search) params = params.set('search', search);
    return this.http.get<PostsAdminPage>(`${this.apiUrl}/posts`, { params });
  }

  toggleHidePost(postId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/posts/${postId}/hide`, {});
  }

  deletePost(postId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/posts/${postId}`);
  }

  getReports(page: number, search?: string): Observable<ReportsPage> {
    let params = new HttpParams().set('page', page.toString());
    if (search) params = params.set('search', search);
    return this.http.get<ReportsPage>(`${this.apiUrl}/reports`, { params });
  }

  reviewReport(reportId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reports/${reportId}/review`, {});
  }

  dismissReport(reportId: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.apiUrl}/reports/${reportId}/dismiss`, {});
  }
}
