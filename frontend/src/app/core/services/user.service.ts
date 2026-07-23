import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User, UsersPage } from '../../models/models';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  currentUser = signal<User | null>(null);

  setCurrentUser(user: User): void {
    this.currentUser.set(user);
  }

  clearCurrentUser(): void {
    this.currentUser.set(null);
  }

  loadCurrentUser(): void {
    if (this.currentUser()) {
      return;
    }

    this.http.get<User>(`${this.apiUrl}/me`).subscribe({
      next: (user) => this.setCurrentUser(user),
      error: (err) => console.error(err),
    });
  }

  updateProfile(profileData: FormData): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/me`, profileData).pipe(
      tap((user) => this.setCurrentUser(user)),
    );
  }

  getUsers(page: number, size: number, search?: string): Observable<UsersPage> {
    let params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    if (search) params = params.set('search', search);
    return this.http.get<UsersPage>(`${this.apiUrl}/users`, { params });
  }
}
