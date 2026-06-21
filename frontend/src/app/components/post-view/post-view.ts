import { Component, inject } from '@angular/core';
import { EditPostComponent } from '../edit-post/edit-post';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-post-view',
  imports: [EditPostComponent],
  templateUrl: './post-view.html',
  styleUrls: ['./post-view.css'],
})
export class PostDetailsComponent {
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.url.subscribe(() => {
      this.fetchPostData();
    });
  }
  fetchPostData(): void {
    const postId = this.route.snapshot.paramMap.get('id');
  }
}
