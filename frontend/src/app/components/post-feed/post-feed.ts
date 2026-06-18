import { Component, HostListener, inject, Input, OnInit } from '@angular/core'; // 🔥 ضفنا Input
import { Post } from '../../models/models';
import { PostService } from '../../core/services/post.service';

@Component({
  selector: 'app-posts-feed',
  standalone: true, // تأكد منها
  templateUrl: './post-feed.html',
  styleUrls: ['./post-feed.css'],
})
export class PostFeed implements OnInit {
  private postService = inject(PostService);

  @Input() userId: number | null = null;

  posts = this.postService.posts;
  currentPage = 0;
  isLastPage = false;
  isLoading = false;
  likeCount = 0;
  comments = 'fff';
  currentMediaIndex = 0;
  toggleOptions = false;

  ngOnInit() {
    this.postService.resetPosts();
    this.currentPage = 0;
    this.isLastPage = false;
    this.isLoading = false;
    this.loadNextPage();
  }

  loadNextPage() {
    if (this.isLoading || this.isLastPage) return;

    this.isLoading = true;

    const postsObservable = this.userId
      ? this.postService.getUserPosts(this.userId, this.currentPage)
      : this.postService.getPosts(this.currentPage);

    postsObservable.subscribe({
      next: (response) => {
        const newPosts = response.content;
        this.isLastPage = response.last;

        if (newPosts.length > 0) {
          this.postService.appendPosts(newPosts);
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
}
