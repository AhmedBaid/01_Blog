import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../models/models';

interface PostsPage {
  content: Post[];
  last: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PostService {
  apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);
  posts = signal<Post[]>([]);

  createPost(postData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, postData);
  }

  getPosts(page: number): Observable<PostsPage> {
    return this.http.get<PostsPage>(`${this.apiUrl}/posts?page=${page}`);
  }

  addPost(post: Post): void {
    this.posts.update((current) => [post, ...current]);
  }

  appendPosts(posts: Post[]): void {
    this.posts.update((current) => [...current, ...posts]);
  }
}
