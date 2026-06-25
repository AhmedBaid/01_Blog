import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User, UserData } from '../../models/models';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  userService = inject(UserService);
  private apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);
  register(userData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }
  login(credentials: UserData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
    );
  }
  logout(): void {
    localStorage.removeItem('token');
    this.userService.clearCurrentUser();
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  isUserLoggedIn(): boolean {
    return !!this.getToken();
  }
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
}
