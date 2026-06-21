package Blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Blog.entity.Comment;
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    long countByPost_PostId(Long postId);
}
