package Blog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Blog.dto.RegisterUserDTO;
import Blog.service.RegisterService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {
    private final RegisterService registerService;

    public RegisterController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterUserDTO registrationData) {
        registerService.registerUser(registrationData);
        return ResponseEntity.ok("User registered successfully!");
    }
}
