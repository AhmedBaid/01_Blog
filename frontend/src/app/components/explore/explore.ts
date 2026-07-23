import { Component, HostListener, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PostService } from '../../core/services/post.service';
import { Post } from '../../models/models';

@Component({
  selector: 'app-explore',
  imports: [FormsModule],
  templateUrl: './explore.html',
  styleUrls: ['./explore.css'],
})
export class ExploreComponent {
  private postService = inject(PostService);
  private router = inject(Router);

  posts = signal<Post[]>([]);
  loading = signal(false);
  loadingMore = signal(false);
  last = signal(false);
  search = signal('');

  private page = 0;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() {
    this.loadExplorePage();
  }

  refresh() {
    this.page = 0;
    this.posts.set([]);
    this.last.set(false);
    this.loadExplorePage();
  }

  onSearchInput() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.page = 0;
      this.posts.set([]);
      this.last.set(false);
      this.loadExplorePage();
    }, 1000);
  }

  loadExplorePage() {
    if (this.loading() || this.loadingMore() || this.last()) return;

    const isFirstPage = this.page === 0;

    if (isFirstPage) {
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.postService.getExplorePosts(this.page, this.search()).subscribe({
      next: (page) => {
        this.posts.update((list) => [...list, ...page.content]);
        this.last.set(page.last);
        this.page++;
        this.loading.set(false);
        this.loadingMore.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.loadingMore.set(false);
      },
    });
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    if (scrollY + windowHeight >= docHeight - 300) {
      this.loadExplorePage();
    }
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

  goToProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
  }

  viewPost(postId: number): void {
    this.router.navigate(['/post', postId]);
  }
}
