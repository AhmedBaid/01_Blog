package Blog.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.multipart.MultipartFile;

import Blog.dto.RegisterUserDTO;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.helpers.FileValidator;
import Blog.repository.UserRepository;

@Service
public class RegisterService {
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;
    private static final Path AVATAR_UPLOAD_DIR = Paths.get("data", "avatars");
    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif");

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public RegisterService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    };

    public void registerUser(RegisterUserDTO registerDto) {
        if (userRepository.existsByEmail(registerDto.getEmail())) {
            throw new GlobalException("Email is already in use!", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByUsername(registerDto.getUsername())) {
            throw new GlobalException("Username is already taken!", HttpStatus.CONFLICT);
        }
        User user = new User();
        user.setFirstname(registerDto.getFirstname());
        user.setLastname(registerDto.getLastname());
        user.setUsername(registerDto.getUsername());
        user.setEmail(registerDto.getEmail());
        user.setBio(registerDto.getBio());
        user.setAvatar(saveAvatar(registerDto.getAvatar()));
        user.setPassword(passwordEncoder.encode(registerDto.getPassword()));
        userRepository.save(user);
    }

    private String saveAvatar(MultipartFile avatar) {
        if (avatar == null || avatar.isEmpty()) {
            return null;
        }

        if (avatar.getSize() > MAX_AVATAR_SIZE) {
            throw new GlobalException("Avatar size must not exceed 5MB", HttpStatus.BAD_REQUEST);
        }

        String contentType = FileValidator.getRealMimeType(avatar);
        System.out.println("Avatar content type: +++++++++++++++++++" + contentType);
        if (contentType == null || !ALLOWED_AVATAR_TYPES.contains(contentType)) {
            throw new GlobalException("Avatar must be a JPEG, PNG, WEBP, or GIF image", HttpStatus.BAD_REQUEST);
        }

        try {
            Files.createDirectories(AVATAR_UPLOAD_DIR);

            String extension = getFileExtension(contentType);
            String filename = UUID.randomUUID() + extension;
            Path destination = AVATAR_UPLOAD_DIR.resolve(filename).normalize();

            Files.copy(avatar.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return filename;
        } catch (IOException exception) {
            throw new GlobalException("Could not save avatar image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String getFileExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            default -> "";
        };
    }
}
