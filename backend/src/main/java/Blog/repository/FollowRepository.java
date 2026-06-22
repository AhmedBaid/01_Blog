package Blog.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import Blog.entity.Follower;

@Repository
public interface FollowRepository extends JpaRepository<Follower, Long> {
    Optional<Follower> findByFollower_UserIdAndFollowedTo_UserId(
            Long followerId,
            Long followedToId);

    boolean existsByFollower_UserIdAndFollowedTo_UserId(Long followerId, Long followedToId);
}