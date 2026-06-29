package Blog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Blog.entity.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByPost_PostId(Long postId);

    List<Comment> findByPost_PostIdOrderByCreatedAtDesc(Long postId);
}
