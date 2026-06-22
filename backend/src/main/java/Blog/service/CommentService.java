package Blog.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import Blog.dto.CommentDTO;
import Blog.dto.CommentRequestDTO;
import Blog.entity.Comment;
import Blog.entity.Post;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.helpers.FormatTimeUtil;
import Blog.repository.CommentRepository;
import Blog.repository.PostRepository;
import Blog.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class CommentService {
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;

    public CommentService(PostRepository postRepo,
            CommentRepository commentRepository, UserRepository userRepository) {
        this.postRepository = postRepo;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
    }

    public List<CommentDTO> getPostComments(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new GlobalException("Post not found", HttpStatus.NOT_FOUND);
        }

        List<Comment> comments = commentRepository.findByPost_PostIdOrderByCreatedAtDesc(postId);

        return comments.stream().map(comment -> {
            CommentDTO dto = new CommentDTO();
            dto.setCommentId(comment.getCommentId());
            dto.setContent(comment.getContent());
            dto.setCreatedAt(FormatTimeUtil.formatTimeAgo(comment.getCreatedAt()));

            User commentOwner = comment.getUser();
            dto.setUserId(commentOwner.getUserId());
            dto.setUsername(commentOwner.getUsername());
            dto.setFirstname(commentOwner.getFirstname());
            dto.setLastname(commentOwner.getLastname());
            dto.setAvatar(commentOwner.getAvatar() == null ? null
                    : "http://localhost:8080/avatars/" + commentOwner.getAvatar());

            return dto;
        }).toList();
    }

    @Transactional
    public CommentDTO addComment(Long postId, CommentRequestDTO dto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new GlobalException("Post not found", HttpStatus.NOT_FOUND));

        Comment comment = new Comment();
        comment.setUser(currentUser);
        comment.setPost(post);
        comment.setContent(dto.getContent());

        Comment savedComment = commentRepository.save(comment);

        return mapToCommentDTO(savedComment);
    }

    public CommentDTO mapToCommentDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setCommentId(comment.getCommentId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(FormatTimeUtil.formatTimeAgo(comment.getCreatedAt()));
        dto.setUserId(comment.getUser().getUserId());
        dto.setUsername(comment.getUser().getUsername());
        dto.setFirstname(comment.getUser().getFirstname());
        dto.setLastname(comment.getUser().getLastname());
        dto.setAvatar(comment.getUser().getAvatar() == null ? null : "http://localhost:8080/avatars/" + comment.getUser().getAvatar());
        return dto;
    }
}
