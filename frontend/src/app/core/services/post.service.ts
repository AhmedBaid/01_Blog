import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { LikeResponse, Post, PostsPage } from '../../models/models';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);
  posts = signal<Post[]>([]);
  triggerOpenCreatePost = signal(false);

  createPost(postData: FormData): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/posts`, postData);
  }

  updatePost(postId: number, postData: FormData): Observable<Post> {
    return this.http.put<Post>(`${this.apiUrl}/posts/${postId}`, postData);
  }

  deletePost(postId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/posts/${postId}`);
  }

  LikePost(postId: number): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.apiUrl}/posts/${postId}/like`, {});
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

  removePost(postId: number): void {
    this.posts.update((current) => current.filter((p) => p.id !== postId));
  }

  updatePostInList(updatedPost: Post): void {
    this.posts.update((current) => current.map((p) => (p.id === updatedPost.id ? updatedPost : p)));
  }
}
