import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// import { NotificationService } from '../../core/services/notification.service';
import { SuggestedUser } from '../../models/models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-following-users',
  imports: [],
  templateUrl: './following-users.html',
  styleUrls: ['./following-users.css'],
})
export class FollowingUsers {
  private http = inject(HttpClient);
  private router = inject(Router);
  // private notification = inject(NotificationService);
  private apiUrl = 'http://localhost:8080/api';

  suggestedUsers = signal<SuggestedUser[]>([]);
  isLoading = signal<boolean>(false);

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

  // toggleFollow(user: SuggestedUser): void {
  //   if (user.isFollowed) return;

  //   this.http.post(`${this.apiUrl}/followers/follow/${user.userId}`, {}).subscribe({
  //     next: () => {
  //       this.notification.success(`You are now following ${user.firstname}`, 'Success');

  //       this.suggestedUsers.update(users =>
  //         users.map(u => u.userId === user.userId ? { ...u, isFollowed: true } : u)
  //       );
  //     },
  //     error: (err) => {
  //       this.notification.error(err.error?.message || 'Could not follow user', 'Error');
  //     }
  //   });
  // }
}
