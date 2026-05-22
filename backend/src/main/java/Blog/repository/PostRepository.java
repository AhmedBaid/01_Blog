package Blog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import Blog.entity.Post;

public interface PostRepository extends JpaRepository<Post,Long> {
    
}
