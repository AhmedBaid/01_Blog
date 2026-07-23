package Blog.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Blog.dto.FollowDTO;
import Blog.dto.UserDTO;
import Blog.entity.User;
import Blog.enums.Role;

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

        @Query("SELECT new Blog.dto.UserDTO(" +
                        "u.userId, u.avatar, u.firstname, u.lastname, u.username, u.email, u.role, u.isBanned, u.followersCount, u.followingCount, u.bio) " +
                        "FROM User u " + "ORDER BY u.createdAt DESC")
        List<UserDTO> getAllUsersForAdminDashboard();

        @Query("SELECT new Blog.dto.UserDTO(" +
                        "u.userId, u.avatar, u.firstname, u.lastname, u.username, u.email, u.role, u.isBanned, u.followersCount, u.followingCount, u.bio) " +
                        "FROM User u " +
                        "WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(u.firstname) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(u.lastname) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "ORDER BY u.createdAt DESC")
        Page<UserDTO> getAllUsersForAdminDashboard(@Param("search") String search, Pageable pageable);

        @Query("SELECT new Blog.dto.UserDTO(" +
                        "u.userId, u.avatar, u.firstname, u.lastname, u.username, u.email, u.role, u.isBanned, u.followersCount, u.followingCount, u.bio) " +
                        "FROM User u " +
                        "ORDER BY u.createdAt DESC")
        Page<UserDTO> getAllUsersForAdminDashboard(Pageable pageable);

        long countByRole(Role role);

        long countByCreatedAtGreaterThanEqual(LocalDateTime sevenDaysAgo);

        long countByIsBannedTrue();
}
