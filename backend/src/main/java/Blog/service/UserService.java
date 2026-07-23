package Blog.service;

import java.util.List;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import Blog.config.JwtUtil;
import Blog.dto.EditProfileDto;
import Blog.dto.UserDTO;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.helpers.GetRealMimeType;
import Blog.repository.FollowRepository;
import Blog.repository.PostRepository;
import Blog.repository.UserRepository;

@Service
public class UserService {
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024;
    private static final Path AVATAR_UPLOAD_DIR = Paths.get("data", "avatars");
    private static final Set<String> ALLOWED_AVATAR_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif");

    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    private final PostRepository postRepository;
    private final JwtUtil jwtUtil;

    public UserService(UserRepository userRepository, PostRepository postRepository, JwtUtil jwtUtil,
            FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.followRepository = followRepository;
        this.jwtUtil = jwtUtil;
    }

    public UserDTO getUserProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        return mapUserToUserMeDTO(user);
    }

    public UserDTO getUserProfileById(Long id, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        return mapUserToUserDTO(user, currentUser.getUserId(), id);
    }

    public Page<UserDTO> getAllUsers(int page, int size, String search) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> userPage;
        if (search != null && !search.trim().isEmpty()) {
            userPage = userRepository.searchUsers(search.trim(), pageable);
        } else {
            userPage = userRepository.findAllUsers(pageable);
        }

        return userPage.map(user -> mapUserToUserDTO(user, currentUser.getUserId(), user.getUserId()));
    }

    public UserDTO updateCurrentUserProfile(String username, EditProfileDto editProfileDto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        userRepository.findByEmail(editProfileDto.getEmail()).ifPresent(existingUser -> {
            if (!existingUser.getUserId().equals(user.getUserId())) {
                throw new GlobalException("Email already exists", HttpStatus.BAD_REQUEST);
            }
        });
        userRepository.findByUsername(editProfileDto.getUsername()).ifPresent(existingUser -> {
            if (!existingUser.getUserId().equals(user.getUserId())) {
                throw new GlobalException("Username already exists", HttpStatus.BAD_REQUEST);
            }
        });

        user.setFirstname(editProfileDto.getFirstname());
        user.setLastname(editProfileDto.getLastname());
        user.setEmail(editProfileDto.getEmail());
        user.setUsername(editProfileDto.getUsername());
        user.setBio(editProfileDto.getBio());
        String newToken = jwtUtil.generateToken(user.getUsername(), user.getRole());
        if (editProfileDto.getAvatar() != null && !editProfileDto.getAvatar().isEmpty()) {
            deleteAvatar(user.getAvatar());
            user.setAvatar(saveAvatar(editProfileDto.getAvatar()));
        }

        return mapUserToUpdatedUserDTO(userRepository.save(user), newToken);
    }

    private String saveAvatar(MultipartFile avatar) {
        if (avatar.getSize() > MAX_AVATAR_SIZE) {
            throw new GlobalException("Avatar size must not exceed 5MB", HttpStatus.BAD_REQUEST);
        }

        String contentType = GetRealMimeType.getRealMimeType(avatar);
        if (contentType == null || !ALLOWED_AVATAR_TYPES.contains(contentType)) {
            throw new GlobalException("Invalid avatar type", HttpStatus.BAD_REQUEST);
        }

        try {
            Files.createDirectories(AVATAR_UPLOAD_DIR);
            String fileName = UUID.randomUUID() + getFileExtension(contentType);
            Path destination = AVATAR_UPLOAD_DIR.resolve(fileName).normalize();
            Files.copy(avatar.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return fileName;
        } catch (IOException exception) {
            throw new GlobalException("Could not save avatar image", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void deleteAvatar(String avatarName) {
        if (avatarName == null || avatarName.isBlank()) {
            return;
        }

        try {
            Files.deleteIfExists(AVATAR_UPLOAD_DIR.resolve(avatarName).normalize());
        } catch (IOException exception) {
            System.err.println("Could not delete avatar image: " + avatarName);
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

    public UserDTO mapUserToUserMeDTO(User user) {
        UserDTO userDto = new UserDTO();
        long postCount = postRepository.countByUser_Username(user.getUsername());
        userDto.setUserId(user.getUserId());
        userDto.setUsername(user.getUsername());
        userDto.setAvatar(user.getAvatar() == null ? null : "http://localhost:8080/avatars/" + user.getAvatar());
        userDto.setFirstname(user.getFirstname());
        userDto.setLastname(user.getLastname());
        userDto.setEmail(user.getEmail());
        userDto.setBio(user.getBio());
        userDto.setFollowersCount(user.getFollowersCount());
        userDto.setFollowingCount(user.getFollowingCount());
        userDto.setPostsCount(postCount);
        userDto.setStatus(user.isBanned());
        return userDto;
    }

    public UserDTO mapUserToUserDTO(User user, Long followerId, Long followedToId) {
        UserDTO userDto = new UserDTO();
        boolean isFollowedBycurentUser = followRepository.existsByFollower_UserIdAndFollowedTo_UserId(followerId,
                followedToId);
        long postCount = postRepository.countByUser_Username(user.getUsername());
        userDto.setUserId(user.getUserId());
        userDto.setUsername(user.getUsername());
        userDto.setAvatar(user.getAvatar() == null ? null : "http://localhost:8080/avatars/" + user.getAvatar());
        userDto.setFirstname(user.getFirstname());
        userDto.setLastname(user.getLastname());
        userDto.setEmail(user.getEmail());
        userDto.setBio(user.getBio());
        userDto.setFollowersCount(user.getFollowersCount());
        userDto.setFollowingCount(user.getFollowingCount());
        userDto.setPostsCount(postCount);
        userDto.setFollowedByCurrentUser(isFollowedBycurentUser);
        userDto.setStatus(user.isBanned());
        return userDto;
    }

    public UserDTO mapUserToUpdatedUserDTO(User user, String newToken) {
        UserDTO userDto = new UserDTO();
        long postCount = postRepository.countByUser_Username(user.getUsername());
        userDto.setUserId(user.getUserId());
        userDto.setUsername(user.getUsername());
        userDto.setAvatar(user.getAvatar() == null ? null : "http://localhost:8080/avatars/" + user.getAvatar());
        userDto.setFirstname(user.getFirstname());
        userDto.setLastname(user.getLastname());
        userDto.setEmail(user.getEmail());
        userDto.setBio(user.getBio());
        userDto.setFollowersCount(user.getFollowersCount());
        userDto.setFollowingCount(user.getFollowingCount());
        userDto.setPostsCount(postCount);
        userDto.setNewToken(newToken);
        return userDto;
    }
}
