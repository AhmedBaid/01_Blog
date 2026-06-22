package Blog.service;

import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import Blog.entity.Follower;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.FollowRepository;
import Blog.repository.UserRepository;
import jakarta.transaction.Transactional;

@Service
public class FollowService {
    private final UserRepository userRepository;
    private final FollowRepository followRepository;

    public FollowService(UserRepository userRepository, FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.followRepository = followRepository;
    }

    @Transactional
    public boolean follow(String username, Long followedTo) {
        User follower = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("follower not found", HttpStatus.NOT_FOUND));
        User followedToUser = userRepository.findByUserId(followedTo)
                .orElseThrow(() -> new GlobalException("followedTo not found", HttpStatus.NOT_FOUND));
        if (follower.getUserId().equals(followedToUser.getUserId())) {
            throw new GlobalException("you can not follow yourself", HttpStatus.BAD_REQUEST);
        }
        Optional<Follower> followExist = followRepository
                .findByFollower_UserIdAndFollowedTo_UserId(follower.getUserId(), followedToUser.getUserId());
        if (followExist.isPresent()) {
            followRepository.delete(followExist.get());
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
            followedToUser.setFollowersCount(Math.max(0, followedToUser.getFollowersCount() - 1));
            return false;
        } else {
            Follower followerEntity = new Follower();
            followerEntity.setFollower(follower);
            followerEntity.setFollowedTo(followedToUser);
            followRepository.save(followerEntity);
            follower.setFollowingCount(follower.getFollowingCount() + 1);
            followedToUser.setFollowersCount(followedToUser.getFollowersCount() + 1);
            return true;
        }
    }
}
