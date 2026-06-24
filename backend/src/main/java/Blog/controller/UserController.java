package Blog.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.FollowDTO;
import Blog.dto.UserDTO;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.PostRepository;
import Blog.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public UserController(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;

    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        long postCount = postRepository.countByUser_Username(user.getUsername());
        String avatarUrl = user.getAvatar() == null ? null : "http://localhost:8080/avatars/" + user.getAvatar();

        UserDTO userDTO = new UserDTO(user.getUserId(), user.getUsername(), user.getEmail(), user.getFirstname(),
                user.getLastname(),
                user.getBio(), user.getFollowingCount(), user.getFollowersCount(), postCount, avatarUrl, "", false,user.getIsBanned());

        return ResponseEntity.ok(userDTO);
    }

    @GetMapping("/suggestedUsers")
    public List<UserDTO> getLatestUsersToFollow() {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        Pageable topTen = PageRequest.of(0, 10);

        List<User> users = userRepository.suggestedUsers(currentUser.getUserId(), topTen);

        return users.stream().map(user -> {
            UserDTO dto = new UserDTO();
            dto.setUserId(user.getUserId());
            dto.setUsername(user.getUsername());
            dto.setFirstname(user.getFirstname());
            dto.setLastname(user.getLastname());
            dto.setAvatar(user.getAvatar() != null ? "http://localhost:8080/avatars/" + user.getAvatar() : null);
            dto.setBio(user.getBio());
            return dto;
        }).toList();
    }

    @GetMapping("users/search/{username}")
    public ResponseEntity<List<FollowDTO>> searchUsers(@PathVariable String username) {
        if (username == null || username.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(userRepository.searchUsersByUsername(username.trim()));
    }
}
