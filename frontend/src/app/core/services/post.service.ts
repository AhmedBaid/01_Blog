import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { Post, PostsPage } from '../../models/models';

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
  getUserPosts(userId: number, page: number): Observable<PostsPage> {
    return this.http.get<PostsPage>(`${this.apiUrl}/users/${userId}/posts?page=${page}`);
  }

  addPost(post: Post): void {
    this.posts.update((current) => [post, ...current]);
  }

  appendPosts(posts: Post[]): void {
    this.posts.update((current) => [...current, ...posts]);
  }

  resetPosts(): void {
    this.posts.set([]);
  }
}
