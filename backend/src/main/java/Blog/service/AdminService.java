package Blog.service;

import java.util.List;

import org.springframework.stereotype.Service;

import Blog.dto.PostAdminDTO;
// import Blog.dto.PostDTO;
import Blog.dto.UserDTO;
import Blog.repository.PostRepository;
import Blog.repository.UserRepository;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;

    public AdminService(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    public List<UserDTO> getAllUsersForAdmin() {
        List<UserDTO> users = userRepository.getAllUsersForAdminDashboard();
        return users;
    }

    public List<PostAdminDTO> getAllPostsForAdmin() {
        List<PostAdminDTO> posts = postRepository.findAllPostsForAdminDashboard();
        return posts;
    }

    public void toggleBanStatus(Long userId, boolean ban) {

    }

    public void deleteUserPermanently(Long userId) {

    }

    public void toggleHidePostStatus(Long postId, boolean hide) {

    }

    public void deletePostPermanently(Long postId) {

    }
}
