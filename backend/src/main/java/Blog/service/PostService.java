package Blog.service;

import java.io.IOException;
import java.nio.file.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import Blog.dto.PostCreateDto;
import Blog.dto.PostDTO;
import Blog.entity.Post;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.helpers.FileValidator;
import Blog.repository.LikeRepository;
import Blog.repository.PostRepository;
import Blog.repository.UserRepository;

@Service
public class PostService {
    private static final long MAX_MEDIA_SIZE = 30 * 1024 * 1024;
    private static final Path MEDIA_UPLOAD_DIR = Paths.get("data", "posts");
    private static final Set<String> ALLOWED_MEDIA_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "video/mp4",
            "video/webm",
            "video/ogg");
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    public PostService(PostRepository postRepo, UserRepository userRepo, LikeRepository likeRepository) {
        this.postRepository = postRepo;
        this.userRepository = userRepo;
        this.likeRepository = likeRepository;
    }

    public void createPost(PostCreateDto postCreateDto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        Post post = new Post();
        post.setTitle(postCreateDto.getTitle());
        post.setDescription(postCreateDto.getDescription());
        post.setUser(currentUser);
        if (postCreateDto.getMedias() != null && !postCreateDto.getMedias().isEmpty()) {
            List<String> savedFileNames = saveMedias(postCreateDto.getMedias());

            for (String fileName : savedFileNames) {
                post.getMedias().add(fileName);
            }
        }

        postRepository.save(post);
    }

    public List<String> saveMedias(List<MultipartFile> medias) {
        long totalSize = 0;
        for (MultipartFile file : medias) {
            totalSize += file.getSize();
        }
        if (totalSize > MAX_MEDIA_SIZE) {
            throw new GlobalException("Medias size must not exceed 30MB", HttpStatus.BAD_REQUEST);
        }
        List<String> savedFileNames = new ArrayList<>();
        for (MultipartFile file : medias) {
            String contentType = FileValidator.getRealMimeType(file);
            if (contentType == null || !ALLOWED_MEDIA_TYPES.contains(contentType)) {
                throw new GlobalException("Invalid media type", HttpStatus.BAD_REQUEST);
            }
            try {
                Files.createDirectories(MEDIA_UPLOAD_DIR);

                String extension = getFileExtension(contentType);
                String medianame = UUID.randomUUID() + extension;
                Path destination = MEDIA_UPLOAD_DIR.resolve(medianame).normalize();

                Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
                savedFileNames.add(medianame);
            } catch (IOException exception) {
                throw new GlobalException("Could not save avatar image", HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
        return savedFileNames;

    }

    private String getFileExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            case "image/gif" -> ".gif";
            case "video/mp4" -> ".mp4";
            case "video/webm" -> ".webm";
            case "video/ogg" -> ".ogg";
            default -> "";
        };
    }

    public Page<PostDTO> getAllPosts(Pageable pageable) {
        Page<Post> postsPage = postRepository.findAll(pageable);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        
        return postsPage.map(post -> {
            PostDTO dto = new PostDTO();
            dto.setId(post.getPostId());
            dto.setTitle(post.getTitle());
            dto.setDescription(post.getDescription());

            if (post.getCreatedAt() != null) {
                dto.setCreatedAt(post.getCreatedAt().format(formatter));
            }

            if (currentUser != null) {
                dto.setItsMyPost(post.getUser().getUserId().equals(currentUser.getUserId()));
                dto.setLikedByCurrentUser(
                        likeRepository.existsByPost_PostIdAndUser_UserId(post.getPostId(), currentUser.getUserId()));
            }

            dto.setUserId(post.getUser().getUserId());
            dto.setUsername(post.getUser().getUsername());
            dto.setFirstname(post.getUser().getFirstname());
            dto.setLastname(post.getUser().getLastname());

            if (post.getUser().getAvatar() != null) {
                dto.setAvatar(
                        dto.getAvatar() == null ? null : "http://localhost:8080/avatars/" + post.getUser().getAvatar());
            }

            dto.setMediaUrls(post.getMedias().stream().map(media -> "http://localhost:8080/posts/" + media).toList());

            return dto;
        });
    }
}
