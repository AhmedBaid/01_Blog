package Blog.service;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import Blog.dto.PostCreateDto;
import Blog.dto.PostDTO;
import Blog.entity.Media;
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
                Media mediaEntity = new Media();
                mediaEntity.setMediaName(fileName);
                mediaEntity.setPost(post);

                post.getMedias().add(mediaEntity);
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

    public List<PostDTO> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc().stream().map(post -> mapToDTO(post)).toList();
    }

    private PostDTO mapToDTO(Post post) {
        PostDTO dto = new PostDTO();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        boolean isLikedByCurrentUser = likeRepository.existsByPost_PostIdAndUser_UserId(post.getPostId(),
                currentUser.getUserId());
        boolean isItMyPost = post.getUser().getUserId() == currentUser.getUserId();
        dto.setId(post.getPostId());
        dto.setUserId(post.getUser().getUserId());
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getDescription());

        dto.setUsername(post.getUser().getUsername());
        dto.setFirstname(post.getUser().getFirstname());
        dto.setLastname(post.getUser().getLastname());
        dto.setAvatar(post.getUser().getAvatar() == null ? null
                : "http://localhost:8080/avatars/" + post.getUser().getAvatar());
        dto.setLikedByCurrentUser(isLikedByCurrentUser);
        dto.setItsMyPost(isItMyPost);
        dto.setMediaUrls(
                post.getMedias()
                        .stream()
                        .map(media -> "http://localhost:8080/posts/" + media.getMediaName())
                        .toList());
        dto.setCreatedAt(post.getCreatedAt().toString());
        return dto;
    }
}
