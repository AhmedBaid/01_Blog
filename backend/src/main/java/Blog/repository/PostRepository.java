package Blog.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import Blog.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
}
