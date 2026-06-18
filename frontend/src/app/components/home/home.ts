import { Component, inject } from '@angular/core';
import { CreatePost } from '../create-post/create-post';
import { FollowingUsers } from '../following-users/following-users';
import { PostFeed } from '../post-feed/post-feed';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-home',
  imports: [CreatePost, FollowingUsers, PostFeed],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {
  userService = inject(UserService);
  ngOnInit() {
    this.userService.loadCurrentUser();
  }
}
