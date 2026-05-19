package Blog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import Blog.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameOrEmail(String username, String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}
