package Blog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Blog.dto.FollowDTO;
import Blog.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findByUserId(Long userId);

    Optional<User> findByUsernameOrEmail(String username, String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u " +
            "WHERE u.userId <> :currentUserId " +
            "AND u.userId NOT IN (" +
            "    SELECT f.followedTo.userId FROM Follower f WHERE f.follower.userId = :currentUserId" +
            ") " +
            "ORDER BY u.createdAt DESC")
    List<User> suggestedUsers(@Param("currentUserId") Long currentUserId, Pageable pageable);

    @Query("SELECT new Blog.dto.FollowDTO(" +
            "u.userId, u.avatar, u.firstname, u.lastname, u.username) " +
            "FROM User u " +
            "WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :username, '%'))")
    List<FollowDTO> searchUsersByUsername(@Param("username") String username);
}
