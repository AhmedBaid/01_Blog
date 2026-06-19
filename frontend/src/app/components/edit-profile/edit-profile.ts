import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { Filevalidator } from '../../helpers/getRealMimeType';
import { User } from '../../models/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css'],
})
export class EditProfileComponent {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationToast = inject(NotificationService);
  private getRealMimeType = inject(Filevalidator);

  @Input() user!: User;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<User>();

  editProfileForm: FormGroup;
  selectedFile: File | null = null;
  avatarPreviewUrl = signal<string | null>(null);
  selectedFileName = '';
  avatarError = '';
  isSubmitting = false;

  private readonly maxAvatarSize = 5 * 1024 * 1024;
  private readonly allowedAvatarTypes = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]);

  constructor() {
    this.editProfileForm = this.fb.group({
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
      bio: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    this.editProfileForm.patchValue({
      firstname: this.user.firstname,
      lastname: this.user.lastname,
      username: this.user.username,
      email: this.user.email,
      bio: this.user.bio,
    });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.clearSelectedAvatar();
    this.avatarError = '';

    if (!file) {
      return;
    }

    if (file.size > this.maxAvatarSize) {
      this.avatarError = 'Avatar size must not exceed 5MB.';
      this.notificationToast.error(this.avatarError, 'Invalid avatar');
      input.value = '';
      return;
    }

    const realMimeType = await this.getRealMimeType.validateRealMimeType(file);
    if (!this.allowedAvatarTypes.has(realMimeType)) {
      this.avatarError = 'Avatar must be a JPEG, PNG, WEBP, or GIF image.';
      this.notificationToast.error(this.avatarError, 'Invalid avatar');
      input.value = '';
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.avatarPreviewUrl.set(URL.createObjectURL(file));
  }

  removeSelectedAvatar(): void {
    this.clearSelectedAvatar();
  }

  closeModal(): void {
    this.clearSelectedAvatar();
    this.editProfileForm.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    if (this.editProfileForm.invalid) {
      this.editProfileForm.markAllAsTouched();
      return;
    }

    if (this.avatarError) {
      this.notificationToast.error(this.avatarError, 'Invalid avatar');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const formValues = this.editProfileForm.getRawValue();

    formData.append('firstname', formValues.firstname);
    formData.append('lastname', formValues.lastname);
    formData.append('username', formValues.username);
    formData.append('email', formValues.email);
    formData.append('bio', formValues.bio);

    if (this.selectedFile) {
      formData.append('avatar', this.selectedFile);
    }

    this.userService
      .updateProfile(formData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (user) => {
          this.updated.emit(user);
          this.closeModal();
          this.notificationToast.success('Profile updated successfully', 'Success');
        },
        error: (err) => {
          console.log(err);
          this.notificationToast.error(err.error.message, 'Error');
        },
      });
  }

  private clearSelectedAvatar(): void {
    const previewUrl = this.avatarPreviewUrl();

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    this.avatarPreviewUrl.set(null);
    this.selectedFile = null;
    this.selectedFileName = '';
  }
}
