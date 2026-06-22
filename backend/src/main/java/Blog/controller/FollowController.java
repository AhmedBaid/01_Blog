package Blog.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.service.FollowService;

@RestController
@RequestMapping("/api/")
public class FollowController {
    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    @PostMapping("follow/{followedTo}")
    public ResponseEntity<Boolean> follow(Principal principal, @PathVariable Long followedTo) {
        String username = principal.getName();
        boolean isFollowed = followService.follow(username, followedTo);
        return ResponseEntity.ok(isFollowed);
    }
}
