package Blog.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import Blog.dto.UserDTO;
import Blog.entity.User;
import Blog.exception.GlobalException;
import Blog.repository.PostRepository;
import Blog.repository.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public UserService(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public UserDTO getUserProfileByUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        return mapUserToUserDTO(user);
    }

    public UserDTO getUserProfileById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new GlobalException("User not found", HttpStatus.NOT_FOUND));
        return mapUserToUserDTO(user);
    }

    public UserDTO mapUserToUserDTO(User user) {
        UserDTO userDto = new UserDTO();
        long postCount = postRepository.countByUser_Username(user.getUsername());
        userDto.setUserId(user.getUserId());
        userDto.setUsername(user.getUsername());
        userDto.setAvatar(user.getAvatar() == null ? null : "http://localhost:8080/avatars/" + user.getAvatar());
        userDto.setFirstname(user.getFirstname());
        userDto.setLastname(user.getLastname());
        userDto.setEmail(user.getEmail());
        userDto.setBio(user.getBio());
        userDto.setFollowersCount(user.getFollowersCount());
        userDto.setFollowingCount(user.getFollowingCount());
        userDto.setPostsCount(postCount);
        return userDto;
    }
}
