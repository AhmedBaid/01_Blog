package Blog.repository;

import Blog.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface PostRepository extends JpaRepository<Post, Long> {

    @Query(value = "SELECT p FROM Post p LEFT JOIN FETCH p.user", countQuery = "SELECT COUNT(p) FROM Post p")
    Page<Post> findAllPostsWithUser(Pageable pageable);
}