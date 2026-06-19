package Blog.service;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import Blog.dto.EditPostDto;
import Blog.dto.PostCreateDto;
import Blog.dto.PostDTO;
import Blog.entity.Post;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.helpers.FormatTimeUtil;
import Blog.helpers.GetRealMimeType;
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

    public PostDTO createPost(PostCreateDto postCreateDto) {
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

        Post savedPost = postRepository.save(post);
        return mapToPostDTO(savedPost, currentUser);
    }

    public PostDTO updatePost(Long postId, EditPostDto editPostDto) {
        System.out.println("removed files " + editPostDto.getRemovedMedias());
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new GlobalException("Post not found", HttpStatus.NOT_FOUND));

        if (!post.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new GlobalException("You are not authorized to edit this post", HttpStatus.FORBIDDEN);
        }

        int removedCount = (editPostDto.getRemovedMedias() != null) ? editPostDto.getRemovedMedias().size() : 0;

        boolean hasNewMedias = editPostDto.getMedias() != null && !editPostDto.getMedias().isEmpty();

        if (removedCount > 0 && removedCount == post.getMedias().size() && !hasNewMedias) {
            throw new GlobalException("At least one media file is required in the post", HttpStatus.BAD_REQUEST);
        }
        
        post.setTitle(editPostDto.getTitle());
        post.setDescription(editPostDto.getDescription());

        if (editPostDto.getRemovedMedias() != null && !editPostDto.getRemovedMedias().isEmpty()) {
            deleteOldMedias(editPostDto.getRemovedMedias());
            post.getMedias().removeAll(editPostDto.getRemovedMedias());
        }
        if (editPostDto.getMedias() != null && !editPostDto.getMedias().isEmpty()) {
            deleteOldMedias(post.getMedias());
            post.getMedias().clear();
            List<String> savedFileNames = saveMedias(editPostDto.getMedias());
            post.getMedias().addAll(savedFileNames);
        }

        Post savedPost = postRepository.save(post);
        return mapToPostDTO(savedPost, currentUser);
    }

    public void deletePost(Long postId) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new GlobalException("Post not found", HttpStatus.NOT_FOUND));

        if (!post.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new GlobalException("You are not authorized to delete this post", HttpStatus.FORBIDDEN);
        }

        deleteOldMedias(post.getMedias());
        postRepository.delete(post);
    }

    private void deleteOldMedias(List<String> mediaNames) {
        for (String mediaName : mediaNames) {
            try {
                Path filePath = MEDIA_UPLOAD_DIR.resolve(mediaName).normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Could not delete media file: " + mediaName);
            }
        }
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
            String contentType = GetRealMimeType.getRealMimeType(file);
            System.out.println("Content Type: " + contentType);
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
        Page<Post> postsPage = postRepository.findAllPostsWithUser(pageable);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        return postsPage.map(post -> mapToPostDTO(post, currentUser));
    }

    public Page<PostDTO> getUserPosts(Long userId, Pageable pageable) {
        Page<Post> postsPage = postRepository.findAllByUser_UserIdOrderByCreatedAtDesc(userId, pageable);

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));

        return postsPage.map(post -> mapToPostDTO(post, currentUser));
    }

    private PostDTO mapToPostDTO(Post post, User currentUser) {
        PostDTO dto = new PostDTO();
        dto.setId(post.getPostId());
        dto.setTitle(post.getTitle());
        dto.setDescription(post.getDescription());

        if (currentUser != null) {
            dto.setItsMyPost(post.getUser().getUserId().equals(currentUser.getUserId()));
            dto.setLikedByCurrentUser(
                    likeRepository.existsByPost_PostIdAndUser_UserId(post.getPostId(), currentUser.getUserId()));
        }

        dto.setUserId(post.getUser().getUserId());
        dto.setUsername(post.getUser().getUsername());
        dto.setFirstname(post.getUser().getFirstname());
        dto.setLastname(post.getUser().getLastname());
        dto.setAvatar(
                post.getUser().getAvatar() == null ? null
                        : "http://localhost:8080/avatars/" + post.getUser().getAvatar());

        dto.setCreatedAt(FormatTimeUtil.formatTimeAgo(post.getCreatedAt()));
        dto.setMediaUrls(post.getMedias().stream().map(media -> "http://localhost:8080/posts/" + media).toList());

        return dto;
    }
}
