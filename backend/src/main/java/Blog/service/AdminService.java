package Blog.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Blog.dto.PostAdminDTO;
import Blog.dto.AdminStatsDTO;
import Blog.dto.UserDTO;
import Blog.entity.Post;
import Blog.entity.User;
import Blog.enums.Role;
import Blog.exception.GlobalException;
import Blog.repository.PostRepository;
import Blog.repository.ReportRepository;
import Blog.repository.UserRepository;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;
    private static final Path MEDIA_UPLOAD_DIR = Paths.get("data", "posts");

    public AdminService(UserRepository userRepository,
            PostRepository postRepository,
            ReportRepository reportRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
    }

    public List<UserDTO> getAllUsersForAdmin() {
        List<UserDTO> users = userRepository.getAllUsersForAdminDashboard();
        return users;
    }

    public List<PostAdminDTO> getAllPostsForAdmin() {
        List<PostAdminDTO> posts = postRepository.findAllPostsForAdminDashboard();
        return posts;
    }

    @Transactional
    public boolean toggleBanStatus(Long userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new GlobalException("user not found", HttpStatus.NOT_FOUND));
        if (user.isBanned()) {
            user.setBanned(false);
            return false;
        } else {
            user.setBanned(true);
            return true;
        }
    }

    @Transactional
    public boolean toggleHidePostStatus(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new GlobalException("post not found", HttpStatus.NOT_FOUND));
        if (post.isHidden()) {
            post.setHidden(false);
            return false;
        } else {
            post.setHidden(true);
            return true;
        }
    }

    @Transactional
    public void deleteUserPermanently(Long userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new GlobalException("user not found", HttpStatus.NOT_FOUND));
        userRepository.delete(user);
    }

    @Transactional
    public void deletePostPermanently(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new GlobalException("post not found", HttpStatus.NOT_FOUND));
        deleteOldMedias(post.getMedias());
        postRepository.delete(post);
    }

    public AdminStatsDTO getStats() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        long totalUsers = userRepository.count();
        long totalPosts = postRepository.count();
        long totalReports = reportRepository.count();
        long totalAdmins = userRepository.countByRole(Role.ADMIN);

        long newUsersThisWeek = userRepository.countByCreatedAtGreaterThanEqual(sevenDaysAgo);
        long newPostsThisWeek = postRepository.countByCreatedAtGreaterThanEqual(sevenDaysAgo);
        long bannedUsersCount = userRepository.countByIsBannedTrue();
        long hiddenPostsCount = postRepository.countByIsHiddenTrue();

        return new AdminStatsDTO(
                totalUsers,
                totalPosts,
                totalAdmins,
                totalReports,
                newUsersThisWeek,
                newPostsThisWeek,
                bannedUsersCount,
                hiddenPostsCount);
    }

    private void deleteOldMedias(List<String> mediaNames) {
        for (String mediaName : mediaNames) {
            try {
                Path filePath = MEDIA_UPLOAD_DIR.resolve(mediaName).normalize();
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                System.err.println("Could not delete media file: " + mediaName);
            }
        }
    }
}
