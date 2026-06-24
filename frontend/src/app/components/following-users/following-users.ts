import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../core/services/notification.service';
import { SuggestedUser } from '../../models/models';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-following-users',
  imports: [],
  templateUrl: './following-users.html',
  styleUrls: ['./following-users.css'],
})
export class FollowingUsers {
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private apiUrl = 'http://localhost:8080/api';

  suggestedUsers = signal<SuggestedUser[]>([]);
  isLoading = signal<boolean>(false);
  FollowingIds = new Set<number>();

  ngOnInit(): void {
    this.loadSuggestedUsers();
  }

  loadSuggestedUsers(): void {
    this.isLoading.set(true);
    this.http.get<SuggestedUser[]>(`${this.apiUrl}/suggestedUsers`).subscribe({
      next: (users) => {
        this.suggestedUsers.set(users.map((u) => ({ ...u, isFollowed: false })));
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching suggested users:', err);
        this.isLoading.set(false);
      },
    });
  }
  goToProfile(userId: number): void {
    this.router.navigate([`/profile/${userId}`]);
  }

  toggleFollow(user: SuggestedUser): void {
    if (this.FollowingIds.has(user.userId)) return;
    this.FollowingIds.add(user.userId);
    this.FollowingIds = new Set(this.FollowingIds);

    this.http
      .post<boolean>(`${this.apiUrl}/follow/${user.userId}`, {})
      .pipe(finalize(() => this.FollowingIds.delete(user.userId)))
      .subscribe({
        next: (isFollowe) => {
          isFollowe == true
            ? this.notification.success(`You are now following ${user.firstname}`, 'Success')
            : this.notification.info(`You unfollowed ${user.firstname}`, 'Success');
          this.suggestedUsers.update((users) =>
            users.map((u) => (u.userId === user.userId ? { ...u, isFollowed: isFollowe } : u)),
          );
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Could not follow user', 'Error');
        },
      });
  }
  isFollowSubmitting(userId: number): boolean {
    return this.FollowingIds.has(userId);
  }
}
