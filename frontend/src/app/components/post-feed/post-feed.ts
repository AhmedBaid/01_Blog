import { Component, HostListener, inject, Input, signal } from '@angular/core';
import { Post } from '../../models/models';
import { PostService } from '../../core/services/post.service';
import { NotificationService } from '../../core/services/notification.service';
import { EditPostComponent } from '../edit-post/edit-post';

@Component({
  selector: 'app-posts-feed',
  imports: [EditPostComponent],
  templateUrl: './post-feed.html',
  styleUrls: ['./post-feed.css'],
})
export class PostFeed {
  private postService = inject(PostService);
  private notificationToast = inject(NotificationService);

  @Input() userId: number | null = null;

  posts = this.postService.posts;
  currentPage = 0;
  isLastPage = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  likeCount = 0;
  comments = 'fff';
  currentMediaIndex = 0;
  toggleOptions = false;
  editingPost: Post | null = null;
  deletingPost: Post | null = null;
  isDeleting = false;

  ngOnInit() {
    this.postService.resetPosts();
    this.currentPage = 0;
    this.isLastPage.set(false);
    this.isLoading.set(false);
    this.loadNextPage();
  }

  loadNextPage() {
    if (this.isLoading() || this.isLastPage()) return;

    this.isLoading.set(true);

    const postsObservable = this.userId
      ? this.postService.getUserPosts(this.userId, this.currentPage)
      : this.postService.getPosts(this.currentPage);

    postsObservable.subscribe({
      next: (response) => {
        const newPosts = response.content;
        this.isLastPage.set(response.last);

        if (newPosts.length > 0) {
          this.postService.appendPosts(newPosts);
          this.currentPage++;
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      },
    });
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const pos =
      (document.documentElement.scrollTop || document.body.scrollTop) +
      document.documentElement.clientHeight;
    const max = document.documentElement.scrollHeight;
    if (pos >= max - 200) {
      this.loadNextPage();
    }
  }

  toggleLike(): void {}

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
