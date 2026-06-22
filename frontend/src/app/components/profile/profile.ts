import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SuggestedUser, User } from '../../models/models';
import { NotificationService } from '../../core/services/notification.service';
import { PostFeed } from '../post-feed/post-feed';
import { EditProfileComponent } from '../edit-profile/edit-profile';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [PostFeed, EditProfileComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfileComponent {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private apiUrl = 'http://localhost:8080/api/users';
  private followapiUrl = 'http://localhost:8080/api';
  private apime = 'http://localhost:8080/api';

  covers: string[] = [
    '1.jpeg',
    '2.jpeg',
    '3.jpeg',
    '4.jpeg',
    '5.jpeg',
    '6.jpeg',
    '7.jpeg',
    '8.jpeg',
    '9.jpeg',
    '10.jpeg',
    '11.jpeg',
    '12.jpeg',
    '13.jpeg',
    '14.jpeg',
    '15.jpeg',
  ];
  randomIndex = Math.floor(Math.random() * this.covers.length);
  cover = 'http://localhost:8080/covers/' + this.covers[this.randomIndex];

  user = signal<User | null>(null);
  isMyOwnProfile = signal<boolean>(false);
  isLoading = signal<boolean>(true);
  CurrentuserId = signal<number | null>(null);
  isEditProfileOpen = signal<boolean>(false);
  FollowingIds = new Set<number>();

  ngOnInit(): void {
    this.route.url.subscribe(() => {
      this.fetchProfileData();
    });
  }

  fetchProfileData(): void {
    this.isLoading.set(true);
    const userId = this.route.snapshot.paramMap.get('id');
    const isMePath = this.route.snapshot.url.some((segment) => segment.path === 'me');

    this.http.get<User>(`${this.apime}/me`).subscribe({
      next: (currentUser) => {
        this.CurrentuserId.set(currentUser.userId);

        if (isMePath || (userId && userId === currentUser.userId.toString())) {
          this.isMyOwnProfile.set(true);
          this.http.get<User>(`${this.apiUrl}/me`).subscribe({
            next: (data) => {
              this.user.set(data);
              this.isLoading.set(false);
            },
            error: (err) => {
              console.error(err);
              this.notification.error(
                'Could not load your profile details. Please try again later.',
              );
              this.isLoading.set(false);
            },
          });
        } else {
          this.isMyOwnProfile.set(false);
          this.http.get<User>(`${this.apiUrl}/${userId}`).subscribe({
            next: (data) => {
              this.user.set(data);
              this.isLoading.set(false);
            },
            error: (err) => {
              console.error(err);
              this.router.navigate(['/home']);
              this.isLoading.set(false);
            },
          });
        }
      },
      error: (err) => {
        console.error('Failed to fetch current user info:', err);
        this.isLoading.set(false);
      },
    });
  }

  openEditProfile(): void {
    this.isEditProfileOpen.set(true);
  }

  closeEditProfile(): void {
    this.isEditProfileOpen.set(false);
  }

  onProfileUpdated(updatedUser: User): void {
    this.user.set(updatedUser);
  }

  toggleFollow(user: User): void {
    if (this.FollowingIds.has(user.userId)) return;
    this.FollowingIds.add(user.userId);
    this.FollowingIds = new Set(this.FollowingIds);

    this.http
      .post<boolean>(`${this.followapiUrl}/follow/${user.userId}`, {})
      .pipe(
        finalize(() => {
          this.FollowingIds.delete(user.userId);
          this.FollowingIds = new Set(this.FollowingIds);
        }),
      )
      .subscribe({
        next: (isFollowe) => {
          this.user.update((cuser) => {
            if (!cuser) return null;

            return {
              ...cuser,
              FollowedByCurrentUser: isFollowe,
            };
          });

          if (isFollowe) {
            this.notification.success(`You are now following ${user.firstname}`, 'Success');
          } else {
            this.notification.info(`You unfollowed ${user.firstname}`, 'Success');
          }
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
