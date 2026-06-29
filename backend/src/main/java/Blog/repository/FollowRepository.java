package Blog.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import Blog.dto.FollowDTO;
import Blog.entity.Follower;
import Blog.entity.User;

@Repository
public interface FollowRepository extends JpaRepository<Follower, Long> {
        Optional<Follower> findByFollower_UserIdAndFollowedTo_UserId(
                        Long followerId,
                        Long followedToId);

        boolean existsByFollower_UserIdAndFollowedTo_UserId(Long followerId, Long followedToId);

        @Query("SELECT new Blog.dto.FollowDTO(" +
                        "f.follower.userId, " +
                        "f.follower.avatar, " +
                        "f.follower.firstname, " +
                        "f.follower.lastname, " +
                        "f.follower.username) " +
                        "FROM Follower f " +
                        "WHERE f.followedTo.userId = :profileUserId")
        List<FollowDTO> findFollowersByUserId(@Param("profileUserId") Long profileUserId);

        @Query("SELECT new Blog.dto.FollowDTO(" +
                        "f.followedTo.userId, " +
                        "f.followedTo.avatar, " +
                        "f.followedTo.firstname, " +
                        "f.followedTo.lastname, " +
                        "f.followedTo.username) " +
                        "FROM Follower f " +
                        "WHERE f.follower.userId = :profileUserId")
        List<FollowDTO> findFollowingByUserId(@Param("profileUserId") Long profileUserId);

        List<Follower> findByFollower(User follower);

        List<Follower> findByFollowedTo(User followedTo);
}