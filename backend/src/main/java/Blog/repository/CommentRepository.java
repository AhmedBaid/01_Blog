package Blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import Blog.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByPost_PostId(Long postId);
}
