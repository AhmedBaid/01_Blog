package Blog.controller;


import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.data.domain.*;
import Blog.dto.PostCreateDto;
import Blog.dto.PostDTO;
import Blog.service.PostService;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/api")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @PostMapping("/posts")
    public ResponseEntity<PostDTO> createPost(@Valid @ModelAttribute PostCreateDto postCreateDto) {
        return ResponseEntity.ok(postService.createPost(postCreateDto));
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<PostDTO>> getPosts(@RequestParam(defaultValue = "0") int page) {
        Pageable pageable = PageRequest.of(page, 5, Sort.by("createdAt").descending());
        return ResponseEntity.ok(postService.getAllPosts(pageable));
    }
}
