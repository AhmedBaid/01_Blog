import { Component, inject } from '@angular/core';
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
  posts: Post[] = [];
  likeCount = 0;
  comments = 'fff';
  currentMediaIndex = 0;
  ngOnInit() {
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
      },
      error: (err) => {
        console.log(err);
      },
    });
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
}
