import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core'; // Add ChangeDetectorRef
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [MatIconModule, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent implements OnInit {
  user: any;
  authService = inject(AuthService);
  // Inject the ChangeDetectorRef
  private cdr = inject(ChangeDetectorRef);
  flName: string = '';

  ngOnInit() {
    if (!this.authService.getToken()) {
      return;
    }

    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        console.log('User data fetched successfully:', userData);
        this.user = userData;

        if (!this.user?.avatar) {
          this.flName =
            this.user.firstname.charAt(0).toUpperCase() +
            this.user.lastname.charAt(0).toUpperCase();
        }

        // Tell Angular it is safe to update the HTML now!
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },
    });
  }
}
