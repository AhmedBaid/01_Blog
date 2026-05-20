import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthServiceTs } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { UserData } from '../../../models/models';
import { finalize } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthServiceTs);
  private router = inject(Router);
  private notificationToast = inject(NotificationService);
  loginForm = this.fb.group({
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });
  isSubmitting = false;

  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const userData: UserData = {
      emailOrUsername: this.loginForm.value.login || '',
      password: this.loginForm.value.password || '',
    };
    this.authService
      .login(userData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (_) => {
          this.notificationToast.success('Login successful', 'Success');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Login error:', err);
          const errorMessage =
            err.error?.message || 'An error occurred during login. Please try again.';
          this.notificationToast.error(errorMessage, 'Login Failed');
        },
      });
  }
}
