import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserData } from '../../models/models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);
  register(userData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, userData);
  }
  login(credentials: UserData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response: any) => {
        console.log('Login response:', response);
        if (response && response.token) {
          localStorage.setItem('token', response.token);
        }
      }),
    );
  }
  logout(): void {
    localStorage.removeItem('token');
  }
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  isUserLoggedIn(): boolean {
    return !!this.getToken();
  }
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }
}
