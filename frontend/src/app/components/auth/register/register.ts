import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthServiceTs } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;
  avatarError = '';
  isSubmitting = false;

  private readonly maxAvatarSize = 2 * 1024 * 1024;
  private readonly allowedAvatarTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  private fb = inject(FormBuilder);
  private authService = inject(AuthServiceTs);
  private router = inject(Router);
  private notificationToast = inject(ToastrService);

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
      bio: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(100)]],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = null;
    this.avatarError = '';

    if (!file) {
      return;
    }

    if (file.size > this.maxAvatarSize) {
      this.avatarError = 'Avatar size must not exceed 2MB.';
      input.value = '';
      return;
    }

    if (!this.allowedAvatarTypes.includes(file.type)) {
      this.avatarError = 'Avatar must be a JPEG, PNG, WEBP, or GIF image.';
      input.value = '';
      return;
    }

    this.selectedFile = file;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.notificationToast.error('Please fix the form fields before submitting.', 'Invalid form');
      return;
    }

    if (this.avatarError) {
      this.notificationToast.error(this.avatarError, 'Invalid avatar');
      return;
    }

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

    this.isSubmitting = true;
    this.authService.register(formData).pipe(
      finalize(() => {
        this.isSubmitting = false;
      }),
    ).subscribe({
      next: (_) => {
        this.notificationToast.success('Registration successful', 'Success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error('Registration error:', err);
        this.notificationToast.error('Registration failed', 'Error');
      },
    });
  }
}
