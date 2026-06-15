import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
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
}
