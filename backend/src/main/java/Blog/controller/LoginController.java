package Blog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import Blog.dto.LoginDTO;
import Blog.dto.LoginResponseDTO;
import Blog.service.LoginService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class LoginController {
    private final LoginService loginService;

    public LoginController(LoginService loginService) {
        this.loginService = loginService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@Valid @RequestBody LoginDTO loginData) {
        LoginResponseDTO userData = loginService.login(loginData);
        return ResponseEntity.ok(userData);
    }
}
