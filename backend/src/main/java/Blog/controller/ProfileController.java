package Blog.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.dto.EditProfileDto;
import Blog.dto.UserDTO;
import Blog.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProfileController {
    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/me")
    public ResponseEntity<UserDTO> getCurrentUserProfile(Principal principal) {
        String currentUsername = principal.getName();
        return ResponseEntity.ok(userService.getUserProfileByUsername(currentUsername));
    }

    @PutMapping("/users/me")
    public ResponseEntity<UserDTO> updateCurrentUserProfile(
            Principal principal,
            @Valid @ModelAttribute EditProfileDto editProfileDto) {
        return ResponseEntity.ok(userService.updateCurrentUserProfile(principal.getName(), editProfileDto));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserProfileById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserProfileById(id));
    }
}
