package Blog.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.FollowDTO;
import Blog.repository.FollowRepository;
import Blog.service.FollowService;

@RestController
@RequestMapping("/api")
public class FollowController {
    private final FollowService followService;
    private final FollowRepository followRepository;

    public FollowController(FollowService followService, FollowRepository followRepository) {
        this.followService = followService;
        this.followRepository = followRepository;
    }

    @PostMapping("/follow/{followedTo}")
    public ResponseEntity<Boolean> follow(Principal principal, @PathVariable Long followedTo) {
        String username = principal.getName();
        boolean isFollowed = followService.follow(username, followedTo);
        return ResponseEntity.ok(isFollowed);
    }

    @GetMapping("/followers/{profileUserId}")
    public List<FollowDTO> getProfileFollowers(@PathVariable Long profileUserId) {
        return followRepository.findFollowersByUserId(profileUserId);
    }

    @GetMapping("/following/{profileUserId}")
    public List<FollowDTO> getProfileFollowing(@PathVariable Long profileUserId) {
        System.out.println(profileUserId + "++++++++++++++++++++++");
        return followRepository.findFollowingByUserId(profileUserId);
    }
}
