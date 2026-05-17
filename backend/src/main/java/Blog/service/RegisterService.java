package Blog.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import Blog.dto.RegisterUserDTO;
import Blog.entity.User;
import Blog.repository.UserRepository;

@Service
public class RegisterService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    };

    public void registerUser(RegisterUserDTO registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new IllegalArgumentException("Error: Username is already taken!");
        }
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }
        User user = new User();
        user.setFirstname(registerDto.getFirstname());
        user.setLastname(registerDto.getLastname());
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setBio(registerDto.getBio());
        user.setAvatar(registerDto.getAvatar());
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        userRepository.save(user);
    }
}
