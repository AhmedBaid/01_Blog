package Blog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.CommentDTO;
import Blog.service.CommentService;

@RestController
public class CommentController {
    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getPostComments(postId));
    }

    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentDTO>> addComment(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.addComment(postId));
    }
}
