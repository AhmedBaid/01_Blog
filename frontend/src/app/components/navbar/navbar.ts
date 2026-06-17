import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [MatIconModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  user: any;
  authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  flName: string = '';
  showProfileMenu: boolean = false;
  navigateToCreatePost() {
    this.router.navigate(['/home']);
  }
  ngOnInit() {
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
    this.router.navigate(['/profile']);
    this.showProfileMenu = false;
  }
  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
