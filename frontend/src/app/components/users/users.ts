import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, finalize } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserAdmin } from '../../models/models';

@Component({
  selector: 'app-users',
  imports: [FormsModule],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class UsersComponent {
  private adminService = inject(AdminService);
  private http = inject(HttpClient);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private apiUrl = 'http://localhost:8080/api';

  users = signal<UserAdmin[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  last = signal(false);
  search = signal('');
  followingIds = new Set<number>();

  private page = 0;
  private searchSubject = new Subject<string>();

  ngOnInit() {
    this.loadUsersPage();
    this.searchSubject.pipe(debounceTime(400)).subscribe(() => this.resetAndLoad());
  }

  resetAndLoad() {
    this.users.set([]);
    this.page = 0;
    this.last.set(false);
    this.loadUsersPage();
  }

  loadUsersPage() {
    if (this.loadingMore() || this.last()) return;
    this.loadingMore.set(true);
    this.loading.set(true);

    const searchTerm = this.search().trim() || undefined;
    this.adminService.getUsers(this.page, searchTerm, 10).subscribe({
      next: (page) => {
        this.users.update((list) => [...list, ...page.content]);
        this.last.set(page.last);
        this.page++;
        this.loadingMore.set(false);
        this.loading.set(false);
      },
      error: () => {
        this.loadingMore.set(false);
        this.loading.set(false);
      },
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    if (scrollY + windowHeight >= docHeight - 300) {
      this.loadUsersPage();
    }
  }

  onSearchInput() {
    this.searchSubject.next(this.search());
  }

  toggleFollow(user: UserAdmin) {
    if (this.followingIds.has(user.userId)) return;
    this.followingIds.add(user.userId);
    this.followingIds = new Set(this.followingIds);

    this.http
      .post<boolean>(`${this.apiUrl}/follow/${user.userId}`, {})
      .pipe(finalize(() => this.followingIds.delete(user.userId)))
      .subscribe({
        next: (isFollowing) => {
          isFollowing
            ? this.notification.success(`You are now following ${user.firstname}`, 'Success')
            : this.notification.info(`You unfollowed ${user.firstname}`, 'Success');

          this.users.update((list) =>
            list.map((u) =>
              u.userId === user.userId
                ? {
                    ...u,
                    followedByCurrentUser: isFollowing,
                    followersCount: isFollowing ? u.followersCount + 1 : u.followersCount - 1,
                  }
                : u,
            ),
          );
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Could not follow user', 'Error');
        },
      });
  }

  isFollowLoading(userId: number): boolean {
    return this.followingIds.has(userId);
  }

  goToProfile(userId: number) {
    this.router.navigate(['/profile', userId]);
  }

  refresh() {
    this.search.set('');
    this.resetAndLoad();
  }
}
