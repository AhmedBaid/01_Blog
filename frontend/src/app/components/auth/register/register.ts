import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs/internal/operators/finalize';
import { NotificationService } from '../../../core/services/notification.service';
import { Filevalidator } from '../../../helpers/getRealMimeType';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: String = '';
  avatarError = '';
  isSubmitting = false;

  private readonly maxAvatarSize = 5 * 1024 * 1024;
  private readonly allowedAvatarTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]);

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationToast = inject(NotificationService);
  private getRealMimeType = inject(Filevalidator);

  constructor() {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      lastname: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      email: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(30),
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,3}'),
        ],
      ],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]],
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.selectedFileName = file ? file.name : '';

    this.selectedFile = null;
    this.avatarError = '';

    if (!file) {
      return;
    }

    if (file.size > this.maxAvatarSize) {
      this.avatarError = 'Avatar size must not exceed 5MB.';
      input.value = '';
      return;
    }
    const realMimeType = await this.getRealMimeType.validateRealMimeType(file);

    if (!this.allowedAvatarTypes.has(realMimeType)) {
      this.avatarError = 'Avatar must be a JPEG, PNG, WEBP, or GIF image.';
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
  
  onSubmit(): void {
    if (this.isSubmitting) {
      return;
    }
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (this.avatarError) {
      this.notificationToast.error(this.avatarError, 'Invalid avatar');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const formValue = this.registerForm.getRawValue();

    formData.append('firstname', formValue.firstname);
    formData.append('lastname', formValue.lastname);
    formData.append('username', formValue.username);
    formData.append('email', formValue.email);
    formData.append('password', formValue.password);
    formData.append('bio', formValue.bio);

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }
    this.authService
      .register(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (_) => {
          this.notificationToast.success('Registration successful', 'Success');
          this.router.navigate(['/auth/login']);
        },
        error: (err) => {
          this.notificationToast.error(err.error.message, 'Error');
        },
      });
  }
}
