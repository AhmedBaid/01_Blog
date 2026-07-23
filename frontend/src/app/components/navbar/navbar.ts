import { Component, inject, ChangeDetectorRef, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { followDto, NotifDto, User } from '../../models/models';
import { NotificationService } from '../../core/services/notification.service';
import { PostService } from '../../core/services/post.service';
import { debounceTime, distinctUntilChanged, Subject, Subscription, switchMap } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private http = inject(HttpClient);
  private notificationToast = inject(NotificationService);
  private postService = inject(PostService);
  private apiNotif = 'http://localhost:8080/api/notifications';
  private apiSearch = 'http://localhost:8080/api/users/search';
  private searchSubject = new Subject<string>();
  private searchSubscription!: Subscription;
  user!: User;
  flName: string = '';
  showProfileMenu: boolean = false;
  showNotifMenu: boolean = false;
  notif = signal<NotifDto[]>([]);
  isGetNotifLoading = signal<boolean>(false);
  searchResults = signal<followDto[]>([]);
  isSearchLoading = signal<boolean>(false);
  showResultsDropdown = signal<boolean>(false);
  navigateToCreatePost() {
    this.postService.triggerOpenCreatePost.set(true);
    this.router.navigate(['/home']);
  }
  navigateToDashboard() {
    this.router.navigate(['/admin/dashboard']);
    this.showProfileMenu = false;
  }
  ngOnInit() {
    this.http.get<NotifDto[]>(`${this.apiNotif}`).subscribe({
      next: (data) => {
        this.notif.set(data);
      },
      error: (err) => {
        console.error(err);
      },
    });
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(1000),
        distinctUntilChanged(),
        switchMap((searchTerm) => {
          if (!searchTerm.trim()) {
            this.isSearchLoading.set(false);
            this.searchResults.set([]);
            return [[]];
          }
          this.isSearchLoading.set(true);
          return this.http.get<followDto[]>(`${this.apiSearch}/${searchTerm}`);
        }),
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
          this.isSearchLoading.set(false);
          this.showResultsDropdown.set(true);
        },
        error: (err) => {
          console.error('Search error:', err);
          this.isSearchLoading.set(false);
        },
      });
    if (!this.authService.getToken()) {
      return;
    }

    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;

        if (!this.user?.avatar) {
          this.flName =
            this.user.firstname.charAt(0).toUpperCase() +
            this.user.lastname.charAt(0).toUpperCase();
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },
    });
  }
  navigateToProfile() {
    this.router.navigate(['/profile/me']);
    this.showProfileMenu = false;
  }
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
  showNotif() {
    this.showNotifMenu = true;
    this.isGetNotifLoading.set(true);
    this.http.get<NotifDto[]>(`${this.apiNotif}`).subscribe({
      next: (data) => {
        this.notif.set(data);
        this.isGetNotifLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isGetNotifLoading.set(false);
      },
    });
  }
  closeNotifMenu() {
    this.showNotifMenu = false;
  }
  markAsRead(notifId: number, postId: number): void {
    this.closeNotifMenu();
    this.http.put(`${this.apiNotif}/${notifId}/read`, {}).subscribe({
      next: () => {
        this.router.navigate([`/post/${postId}`]);
      },
      error: (err) => {
        this.notificationToast.error(err.error?.message || 'Could not read the notif', 'Error');
      },
    });
  }

  goToProfile(userId: number) {
    this.closeNotifMenu();
    this.router.navigate([`/profile/${userId}`]);
  }

  onSearchChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchSubject.next(inputElement.value);
  }

  closeSearch(): void {
    setTimeout(() => {
      this.showResultsDropdown.set(false);
    }, 200);
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }
  navigateToUsers() {
    this.router.navigate(['/users']);
    this.showProfileMenu = false;
  }
  navigateToExplore() {
    this.router.navigate(['/explore']);
    this.showProfileMenu = false;
  }
}
