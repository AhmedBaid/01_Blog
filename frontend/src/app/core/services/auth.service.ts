import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { UserData } from '../../models/models';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceTs {
  private apiUrl = 'http://localhost:8080/api/auth';
  private http = inject(HttpClient);
  register(userData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
  login(credentials: UserData): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((response: any) => {
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
}
