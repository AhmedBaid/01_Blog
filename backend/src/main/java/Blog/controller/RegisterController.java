package Blog.controller;

import org.springframework.http.ResponseEntity;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import Blog.dto.RegisterUserDTO;
import Blog.dto.ResponseDTO;
import Blog.service.RegisterService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class RegisterController {
    private final RegisterService registerService;

    public RegisterController(RegisterService registerService) {
        this.registerService = registerService;
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResponseDTO> register(@Valid @ModelAttribute RegisterUserDTO registrationData) {
        registerService.registerUser(registrationData);
        return ResponseEntity.ok(new ResponseDTO("User registered successfully"));
    }
}
