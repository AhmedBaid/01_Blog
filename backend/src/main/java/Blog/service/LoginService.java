package Blog.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import Blog.config.JwtUtil;
import Blog.dto.LoginDTO;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.UserRepository;
import jakarta.validation.Valid;

@Service
public class LoginService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public String login(@Valid LoginDTO loginData) {
        User user = findUser(loginData.getEmailOrUsername());

        if (!passwordEncoder.matches(loginData.getPassword(), user.getPassword())) {
            throw new GlobalException("Invalid email/username or password", HttpStatus.UNAUTHORIZED);
        }

        return jwtUtil.generateToken(user.getUsername());
    }

    private User findUser(String emailOrUsername) {
        return userRepository.findByUsernameOrEmail(emailOrUsername, emailOrUsername)
                .orElseThrow(() -> new GlobalException("User not found: " + emailOrUsername, HttpStatus.NOT_FOUND));
    }
}
