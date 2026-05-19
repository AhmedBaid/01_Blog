import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthServiceTs } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';


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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('firstname', this.registerForm.value.firstname);
    formData.append('lastname', this.registerForm.value.lastname);
    formData.append('username', this.registerForm.value.username);
    formData.append('email', this.registerForm.value.email);
    formData.append('password', this.registerForm.value.password);
    formData.append('bio', this.registerForm.value.bio);

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: (_) => {
        this.notificationToast.success('Registration successful', 'Success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.notificationToast.error('Registration failed', 'Error');
      },
    });
  }
}
