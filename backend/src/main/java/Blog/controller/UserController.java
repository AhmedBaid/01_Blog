package Blog.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.UserDTO;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.UserRepository;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Principal principal) {
        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        String avatarUrl = user.getAvatar();
        UserDTO userDTO = new UserDTO(user.getUsername(), user.getEmail(), user.getFirstname(), user.getLastname(),
                user.getBio(), user.getFollowingCount(), user.getFollowersCount(), avatarUrl);

        return ResponseEntity.ok(userDTO);
    }
}
