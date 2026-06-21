package Blog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Blog.entity.Like;
@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByPost_PostIdAndUser_UserId(Long postId, Long userId);

    Optional<Like> findByPost_PostIdAndUser_UserId(Long postId, Long userId);

    long countByPost_PostId(Long postId);
}
