import { Component, inject ,OnInit} from '@angular/core';
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
  flName: String = '';
  ngOnInit() {
    this.authService.getCurrentUser().subscribe({
      next: (userData) => {
        this.user = userData;
        if (!this.user?.avatar) {
          this.flName =
            this.user.firstname.charAt(0).toUpperCase() +
            this.user.lastname.charAt(0).toUpperCase();
        }
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      },
    });
  }
}
