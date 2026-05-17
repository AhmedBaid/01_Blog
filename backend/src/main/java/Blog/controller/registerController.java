package Blog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Blog.dto.RegisterUserDTO;
import Blog.service.RegisterService;

@RestController
@RequestMapping("/api/auth")
public class registerController {
    private final RegisterService registerService;

    public registerController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterUserDTO registrationData) {
        registerService.registerUser(registrationData);
        return ResponseEntity.ok("User registered successfully!");
    }
}
