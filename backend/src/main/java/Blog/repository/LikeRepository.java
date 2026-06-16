package Blog.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import Blog.entity.Like;

public interface LikeRepository extends JpaRepository<Like, Long> {
    boolean existsByPost_PostIdAndUser_UserId(Long postId, Long userId);
}
