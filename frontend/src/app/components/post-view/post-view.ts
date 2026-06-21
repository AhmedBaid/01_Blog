import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comments, Post } from '../../models/models';
import { EditPostComponent } from '../edit-post/edit-post';
import { PostService } from '../../core/services/post.service';
import { NotificationService } from '../../core/services/notification.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-post-view',
  standalone: true,
  imports: [CommonModule, FormsModule, EditPostComponent, RouterLink],
  templateUrl: './post-view.html',
  styleUrls: ['./post-view.css'],
})
export class PostDetailsComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postService = inject(PostService);
  private notificationToast = inject(NotificationService);
  private apiUrl = 'http://localhost:8080/api/posts';

  post = signal<Post | null>(null);
  comments = signal<Comments[]>([]);

  isPostLoading = signal<boolean>(true);
  isCommentsLoading = signal<boolean>(true);
  isCommentSubmitting = signal<boolean>(false);
  likingPostIds = new Set<number>();

  newCommentContent = '';

  editingPost: Post | null = null;
  deletingPost: Post | null = null;
  isDeleting = false;

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
        this.router.navigate(['/home']);
        this.isPostLoading.set(false);
      },
    });
  }

  fetchPostComments(postId: number): void {
    this.http.get<Comments[]>(`${`${this.apiUrl}`}/${postId}/comments`).subscribe({
      next: (commentsData) => {
        this.comments.set(commentsData);
        this.isCommentsLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isCommentsLoading.set(false);
      },
    });
  }

  submitComment(): void {
    if (!this.newCommentContent.trim() || this.isCommentSubmitting()) return;

    const currentPost = this.post();
    if (!currentPost) return;

    this.isCommentSubmitting.set(true);

    this.http
      .post<Comments>(`${`${this.apiUrl}`}/${currentPost.id}/comments`, {
        content: this.newCommentContent,
      })
      .subscribe({
        next: (newComment) => {
          this.comments.update((prev) => [newComment, ...prev]);
          this.post.update((p) => (p ? { ...p, commentCount: p.commentCount + 1 } : null));

          this.newCommentContent = '';
          this.isCommentSubmitting.set(false);
        },
        error: (err) => {
          console.error(err);
          this.isCommentSubmitting.set(false);
        },
      });
  }
  toggleLike(post: Post): void {
    if (this.likingPostIds.has(post.id)) return;

    this.likingPostIds.add(post.id);
    const previousState = post.likedByCurrentUser;
    const previousCount = post.likeCount;

    this.postService
      .LikePost(post.id)
      .pipe(finalize(() => this.likingPostIds.delete(post.id)))
      .subscribe({
        next: (likeResponse) => {
          this.postService.posts.update((currentPosts) =>
            currentPosts.map((p) =>
              p.id === post.id
                ? {
                    ...p,
                    likedByCurrentUser: likeResponse.likedByCurrentUser,
                    likeCount: likeResponse.likeCount,
                  }
                : p,
            ),
          );
        },
        error: (err) => {
          console.error('Failed to toggle like', err);
          this.postService.posts.update((currentPosts) =>
            currentPosts.map((p) =>
              p.id === post.id
                ? { ...p, likedByCurrentUser: previousState, likeCount: previousCount }
                : p,
            ),
          );
          this.notificationToast.error('Could not process like action', 'Error');
        },
      });
  }
  isLikeSubmitting(postId: number): boolean {
    return this.likingPostIds.has(postId);
  }

  goToProfile(userId: number): void {
    this.router.navigate([`/profile/${userId}`]);
  }
  goToViewPost(userId: number): void {
    this.router.navigate([`/post/${userId}`]);
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

  openPostOptions(post: Post): void {
    post.toggleOptions = !post.toggleOptions;
  }

  startEdit(post: Post): void {
    post.toggleOptions = false;
    this.editingPost = post;
  }

  onEditClose(): void {
    this.editingPost = null;
  }

  onPostUpdated(_updatedPost: Post): void {
    this.editingPost = null;
  }

  confirmDelete(post: Post): void {
    post.toggleOptions = false;
    this.deletingPost = post;
  }

  cancelDelete(): void {
    this.deletingPost = null;
  }

  executeDelete(): void {
    if (!this.deletingPost || this.isDeleting) return;

    this.isDeleting = true;
    const postId = this.deletingPost.id;

    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.postService.removePost(postId);
        this.deletingPost = null;
        this.isDeleting = false;
        this.notificationToast.success('Post deleted successfully', 'Deleted');
      },
      error: (err) => {
        this.notificationToast.error(err.error?.message || 'Failed to delete post', 'Error');
        this.isDeleting = false;
      },
    });
  }
}
