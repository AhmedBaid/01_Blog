import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../../models/models';

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
}
