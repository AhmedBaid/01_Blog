import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-create-post',
  imports: [],
  templateUrl: './create-post.html',
  styleUrls: ['./create-post.css'],
})
export class CreatePost {
  userService = inject(UserService);
  user = this.userService.currentUser;
}
