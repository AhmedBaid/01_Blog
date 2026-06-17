import { Component, HostListener, inject, signal } from '@angular/core';
import { Post } from '../../models/models';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'app-posts-feed',
  imports: [],
  templateUrl: './post-feed.html',
  styleUrls: ['./post-feed.css'],
})
export class PostFeed {
  private postService = inject(PostService);

  posts = signal<Post[]>([]);
  currentPage = 0;
  isLastPage = false;
  isLoading = false;
  likeCount = 0;
  comments = 'fff';
  currentMediaIndex = 0;
  toggleOptions = false;
  ngOnInit() {
    this.loadNextPage();
  }
  loadNextPage() {
    if (this.isLoading || this.isLastPage) return;

    this.isLoading = true;
    this.postService.getPosts(this.currentPage).subscribe({
      next: (response) => {
        const newPosts = response.content;
        this.isLastPage = response.last;

        if (newPosts.length > 0) {
          this.posts.update((current) => [...current, ...newPosts]);
          this.currentPage++;
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
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
    if (post.currentMediaIndex === undefined) {
      post.currentMediaIndex = 0;
    }

    if (post.currentMediaIndex < post.mediaUrls.length - 1) {
      post.currentMediaIndex++;
    } else {
      post.currentMediaIndex = 0;
    }
  }

  prevMedia(post: Post): void {
    if (post.currentMediaIndex === undefined) {
      post.currentMediaIndex = 0;
    }

    if (post.currentMediaIndex > 0) {
      post.currentMediaIndex--;
    } else {
      post.currentMediaIndex = post.mediaUrls.length - 1;
    }
  }
  openPostOptions(post: Post): void {
    post.toggleOptions = !post.toggleOptions;
  }
}
