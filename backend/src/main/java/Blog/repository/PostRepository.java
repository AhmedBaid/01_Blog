package Blog.repository;

import Blog.dto.PostDTO;
import Blog.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT new Blog.dto.PostDTO(" +
            "p, " +
            "COUNT(DISTINCT l.likeId), " +
            "COUNT(DISTINCT c.commentId), " +
            "CASE WHEN COUNT(DISTINCT l2.likeId) > 0 THEN true ELSE false END) " +
            "FROM Post p " +
            "JOIN FETCH p.user u " +
            "LEFT JOIN Like l ON l.post.postId = p.postId " +
            "LEFT JOIN Comment c ON c.post.postId = p.postId " +
            "LEFT JOIN Like l2 ON l2.post.postId = p.postId AND l2.user.userId = :currentUserId " +
            "GROUP BY p.postId, u.userId")
    Page<PostDTO> findAllPostsWithStats(@Param("currentUserId") Long currentUserId, Pageable pageable);

    @Query("SELECT new Blog.dto.PostDTO(" +
            "p, " +
            "COUNT(DISTINCT l.likeId), " +
            "COUNT(DISTINCT c.commentId), " +
            "CASE WHEN COUNT(DISTINCT l2.likeId) > 0 THEN true ELSE false END) " +
            "FROM Post p " +
            "JOIN FETCH p.user u " +
            "LEFT JOIN Like l ON l.post.postId = p.postId " +
            "LEFT JOIN Comment c ON c.post.postId = p.postId " +
            "LEFT JOIN Like l2 ON l2.post.postId = p.postId AND l2.user.userId = :currentUserId " +
            "WHERE u.userId = :profileUserId " +
            "GROUP BY p.postId, u.userId " +
            "ORDER BY p.createdAt DESC")
    Page<PostDTO> findUserPostsWithStats(
            @Param("profileUserId") Long profileUserId,
            @Param("currentUserId") Long currentUserId,
            Pageable pageable);

    long countByUser_Username(String username);
}