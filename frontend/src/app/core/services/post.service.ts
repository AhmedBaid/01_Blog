import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Post } from '../../models/models';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);
  createPost(postData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/posts`, postData);
  }

  getPosts(page: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/posts?page=${page}`);
  }
}
