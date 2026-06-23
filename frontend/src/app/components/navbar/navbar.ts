import { Component, inject, ChangeDetectorRef, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NotifDto } from '../../models/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  imports: [MatIconModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private http = inject(HttpClient);
  private notificationToast = inject(NotificationService);
  user: any;
  flName: string = '';
  showProfileMenu: boolean = false;
  showNotifMenu: boolean = false;
  notif = signal<NotifDto[]>([]);
  apiNotif = 'http://localhost:8080/api/notifications';
  isGetNotifLoading = signal<boolean>(false);
  navigateToCreatePost() {
    this.router.navigate(['/home']);
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
  markAsRead(notifId: number, userId: number): void {
    this.closeNotifMenu();
    this.http.put(`${this.apiNotif}/${notifId}/read`, {}).subscribe({
      next: () => {
        this.router.navigate([`/profile/${userId}`]);
      },
      error: (err) => {
        this.notificationToast.error(err.error.message, 'Error');
      },
    });
  }
}
