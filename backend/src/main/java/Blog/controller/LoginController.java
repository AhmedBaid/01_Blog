package Blog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Blog.dto.LoginDTO;
import Blog.service.LoginService;
import jakarta.validation.Valid;

@RestController("/api/auth")
public class LoginController {
    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }
    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginDTO loginData) {
        loginService.login(loginData);
        return ResponseEntity.ok("Login successful!");
    }
}
