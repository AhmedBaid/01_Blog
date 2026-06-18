import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PostService } from '../../core/services/post.service';
import { NotificationService } from '../../core/services/notification.service';
import { Filevalidator } from '../../helpers/getRealMimeType';
import { Post } from '../../models/models';
import { finalize } from 'rxjs';

interface FilePreview {
  url: string;
  type: 'image' | 'video';
  name: string;
}

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-post.html',
  styleUrls: ['./edit-post.css'],
})
export class EditPostComponent implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private notificationToast = inject(NotificationService);
  private getRealMimeType = inject(Filevalidator);

  @Input() post!: Post;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<Post>();

  editPostForm: FormGroup;
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
    this.editPostForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(15)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(30)]],
    });
  }

  ngOnInit(): void {
    this.editPostForm.patchValue({
      title: this.post.title,
      description: this.post.description,
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
        if (!this.ALLOWED_TYPES.has(realMimeType)) {
          this.notificationToast.error(`File ${file.name} has an invalid format.`);
          continue;
        }
        this.selectedFiles.push(file);
        const previewUrl = URL.createObjectURL(file);
        this.previews.update((prev) => [
          ...prev,
          { url: previewUrl, type: realMimeType.startsWith('video/') ? 'video' : 'image', name: file.name },
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

  closeModal(): void {
    this.clearPreviews();
    this.editPostForm.reset();
    this.close.emit();
  }

  onSubmit(): void {
    if (this.isSubmitting) return;

    if (this.editPostForm.invalid) {
      this.editPostForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    const formValues = this.editPostForm.getRawValue();

    formData.append('title', formValues.title);
    formData.append('description', formValues.description);

    this.selectedFiles.forEach((file) => {
      formData.append('medias', file);
    });

    this.postService
      .updatePost(this.post.id, formData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (post) => {
          this.postService.updatePostInList(post);
          this.updated.emit(post);
          this.closeModal();
          this.notificationToast.success('Post updated successfully', 'Success');
        },
        error: (err) => {
          this.notificationToast.error(err.error.message, 'Error');
        },
      });
  }
}
