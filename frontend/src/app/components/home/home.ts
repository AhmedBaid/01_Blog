import { Component } from '@angular/core';
import { CreatePost } from '../create-post/create-post';
import { FollowingUsers } from '../following-users/following-users';
import { PostFeed } from '../post-feed/post-feed';

@Component({
  selector: 'app-home',
  imports: [CreatePost,FollowingUsers,PostFeed],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {}
