import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Comment, Post } from '../../models/models';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-post-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-view.html',
  styleUrls: ['./post-view.css'],
})
export class PostDetailsComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private apiUrl = 'http://localhost:8080/api/posts';

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);

  isPostLoading = signal<boolean>(true);
  isCommentsLoading = signal<boolean>(true);
  isCommentSubmitting = signal<boolean>(false);
  likingPostIds = new Set<number>();
  createCommentForm: FormGroup;
  deletingComment = signal<Comment | null>(null);
  isDeleting = false;

  constructor() {
    this.createCommentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
    });
  }
  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const postId = Number(params.get('id'));
      if (postId) {
        this.fetchPostData(postId);
        this.fetchPostComments(postId);
      }
    });
  }

  fetchPostData(postId: number): void {
    this.http.get<Post>(`${`${this.apiUrl}`}/${postId}`).subscribe({
      next: (postData) => {
        postData.currentMediaIndex = 0;
        postData.toggleOptions = false;
        this.post.set(postData);
        this.isPostLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.notification.error(err.error?.message || 'could not fetch the post', 'Error');
        this.router.navigate(['/home']);
        this.isPostLoading.set(false);
      },
    });
  }

  fetchPostComments(postId: number): void {
    this.http.get<Comment[]>(`${`${this.apiUrl}`}/${postId}/comments`).subscribe({
      next: (commentsData) => {
        this.comments.set(commentsData);
        this.isCommentsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.notification.error(err.error?.message || 'could not fetch the comments', 'Error');
        this.isCommentsLoading.set(false);
      },
    });
  }

  submitComment(): void {
    if (this.isCommentSubmitting()) return;
    if (this.createCommentForm.invalid) {
      this.createCommentForm.markAllAsTouched();
      return;
    }
    const currentPost = this.post();
    if (!currentPost) return;

    this.isCommentSubmitting.set(true);
    const formValues = this.createCommentForm.getRawValue();

    const bodyPayload = {
      content: formValues.content,
    };

    this.http
      .post<Comment>(`${`${this.apiUrl}`}/${currentPost.id}/comment`, bodyPayload)
      .subscribe({
        next: (newComment) => {
          this.comments.update((prev) => [newComment, ...prev]);
          this.post.update((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : null));
          this.isCommentSubmitting.set(false);
          this.createCommentForm.reset();
          this.notification.success('comment created successfully', 'Success');
        },
        error: (err) => {
          console.error(err);
          this.isCommentSubmitting.set(false);
          this.notification.error(err.error?.message || 'could not create the comment', 'Error');
        },
      });
  }

  goToProfile(userId: number): void {
    this.router.navigate([`/profile/${userId}`]);
  }

  isVideo(url: string): boolean {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  }

  nextMedia(post: Post): void {
    if (post.currentMediaIndex === undefined) post.currentMediaIndex = 0;
    if (post.currentMediaIndex < post.mediaUrls.length - 1) {
      post.currentMediaIndex++;
    } else {
      post.currentMediaIndex = 0;
    }
  }

  prevMedia(post: Post): void {
    if (post.currentMediaIndex === undefined) post.currentMediaIndex = 0;
    if (post.currentMediaIndex > 0) {
      post.currentMediaIndex--;
    } else {
      post.currentMediaIndex = post.mediaUrls.length - 1;
    }
  }

  confirmDeleteComment(comment: Comment): void {
    this.deletingComment.set(comment);
  }

  cancelDelete(): void {
    this.deletingComment.set(null);
  }
  executeDelete(): void {
    const deletingComment = this.deletingComment();
    if (!deletingComment || this.isDeleting) return;
    const commentId = deletingComment.commentId;
    this.isDeleting = true;
    this.http.delete(`http://localhost:8080/api/comments/${commentId}`).subscribe({
      next: () => {
        this.comments.update((prev) => prev.filter((c) => c.commentId !== commentId));
        this.deletingComment.set(null);
        this.notification.success('comment deleted successfully', 'Success');
      },
      error: (err) => {
        console.error(err);
        this.deletingComment.set(null);
        this.notification.error(err.error?.message || 'could not delete the comment', 'Error');
      },
    });
  }
}
