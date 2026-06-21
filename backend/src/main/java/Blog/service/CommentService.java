package Blog.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import Blog.dto.CommentDTO;
import Blog.entity.Comment;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.helpers.FormatTimeUtil;
import Blog.repository.CommentRepository;
import Blog.repository.PostRepository;

@Service
public class CommentService {
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    public CommentService(PostRepository postRepo,
            CommentRepository commentRepository) {
        this.postRepository = postRepo;
        this.commentRepository = commentRepository;
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

    public List<CommentDTO> addComment(Long postId) {
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
}
