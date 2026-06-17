import { Component, inject, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { finalize } from 'rxjs';
import { Filevalidator } from '../../helpers/getRealMimeType';
import { Router } from '@angular/router';

interface FilePreview {
  url: string;
  type: 'image' | 'video';
  name: string;
}

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css'],
})
export class CreatePost {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private notificationToast = inject(NotificationService);
  private postService = inject(PostService);
  private getRealMimeType = inject(Filevalidator);
  private router = inject(Router);

  createPostForm: FormGroup;
  user = this.userService.currentUser;
  toggle = false;

  selectedFiles: File[] = [];
  previews = signal<FilePreview[]>([]);
  isSubmitting = false;

  readonly MAX_FILE_SIZE = 30 * 1024 * 1024;
  readonly ALLOWED_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/ogg',
  ]);

  constructor() {
    this.createPostForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]],
    });
  }

  async onFileSelected(event: any): Promise<void> {
    if (!event.target.files || event.target.files.length === 0) return;

    const files = Array.from(event.target.files) as File[];
    this.clearPreviews();
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > this.MAX_FILE_SIZE) {
      this.notificationToast.error('Total file size exceeds the 30MB limit.');
      return;
    }
    for (const file of files) {
      try {
        const realMimeType = await this.getRealMimeType.validateRealMimeType(file);
        console.log(`File: ${file.name}, Real MIME Type: ${realMimeType}`);
        if (!this.ALLOWED_TYPES.has(realMimeType)) {
          this.notificationToast.error(`File ${file.name} has an invalid format.`);
          continue;
        }

        this.selectedFiles.push(file);
        const previewUrl = URL.createObjectURL(file);

        this.previews.update((prev) => [
          ...prev,
          {
            url: previewUrl,
            type: realMimeType.startsWith('video/') ? 'video' : 'image',
            name: file.name,
          },
        ]);
      } catch (error) {
        this.notificationToast.error(`Error validating file: ${file.name}`);
      }
    }
  }

  removeFile(index: number): void {
    URL.revokeObjectURL(this.previews()[index].url);
    this.selectedFiles.splice(index, 1);

    this.previews.update((prev) => prev.filter((_, i) => i !== index));
  }

  private clearPreviews(): void {
    this.previews().forEach((p) => URL.revokeObjectURL(p.url));
    this.previews.set([]);
    this.selectedFiles = [];
  }

  openCreatePostModal(): void {
    this.toggle = true;
  }

  closeCreatePostModal(): void {
    this.toggle = false;
    this.clearPreviews();
    this.createPostForm.reset();
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    if (this.createPostForm.invalid) {
      this.createPostForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const formValues = this.createPostForm.getRawValue();

    formData.append('title', formValues.title);
    formData.append('description', formValues.description);

    this.selectedFiles.forEach((file) => {
      formData.append('medias', file);
    });
    this.postService
      .createPost(formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
      )
      .subscribe({
        next: (_) => {
          this.closeCreatePostModal();
          this.notificationToast.success('Post Created successfully', 'Success');
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.notificationToast.error(err.error.message, 'Error');
        },
      });
  }
}
