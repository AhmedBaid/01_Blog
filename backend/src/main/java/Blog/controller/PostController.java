package Blog.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;

// import java.util.List;

// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.PostCreateDto;
import Blog.dto.PostDTO;
import Blog.dto.ResponseDTO;
import Blog.service.PostService;
import jakarta.validation.Valid;

// import Blog.entity.Post;

@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/posts")
    public ResponseEntity<ResponseDTO> createPost(@Valid @ModelAttribute PostCreateDto postCreateDto) {
        postService.createPost(postCreateDto);
        return ResponseEntity.ok(new ResponseDTO("Post created successfully"));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<PostDTO>> getPosts() {
        List<PostDTO> posts = postService.getAllPosts();
        return ResponseEntity.ok(posts);
    }
}
