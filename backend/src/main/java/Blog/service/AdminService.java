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
import Blog.dto.ReportDTO;
import Blog.dto.UserDTO;
import Blog.entity.Follower;
import Blog.entity.Post;
import Blog.entity.Report;
import Blog.entity.User;
import Blog.enums.Role;
import Blog.enums.Status;
import Blog.exception.GlobalException;
import Blog.repository.FollowRepository;
import Blog.repository.PostRepository;
import Blog.repository.ReportRepository;
import Blog.repository.UserRepository;

@Service
public class AdminService {
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final ReportRepository reportRepository;
    private final FollowRepository followRepository;
    private static final Path MEDIA_UPLOAD_DIR = Paths.get("data", "posts");

    public AdminService(UserRepository userRepository,
            PostRepository postRepository,
            ReportRepository reportRepository,
            FollowRepository followRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.reportRepository = reportRepository;
        this.followRepository = followRepository;
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
        if (user.getRole() == Role.ADMIN) {
            throw new GlobalException("You cannot ban an administrator account", HttpStatus.FORBIDDEN);
        }
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
        if (user.getRole() == Role.ADMIN) {
            throw new GlobalException("You cannot delete an administrator account", HttpStatus.FORBIDDEN);
        }

        List<Follower> followersOfUser = followRepository.findByFollowedTo(user);
        for (Follower f : followersOfUser) {
            User follower = f.getFollower();
            follower.setFollowingCount(Math.max(0, follower.getFollowingCount() - 1));
        }

        List<Follower> followedByUser = followRepository.findByFollower(user);
        for (Follower f : followedByUser) {
            User followedTo = f.getFollowedTo();
            followedTo.setFollowersCount(Math.max(0, followedTo.getFollowersCount() - 1));
        }


        List<Post> userPosts = postRepository.findByUser(user);
        for (Post post : userPosts) {
            if (post.getMedias() != null) {
                deleteOldMedias(post.getMedias());
            }
        }

        userRepository.delete(user);
    }

    @Transactional
    public void deletePostPermanently(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new GlobalException("post not found", HttpStatus.NOT_FOUND));
        deleteOldMedias(post.getMedias());
        postRepository.delete(post);
    }

    public List<ReportDTO> getAllReports() {
        return reportRepository.findAllReportsForAdmin();
    }

    @Transactional
    public void reviewReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new GlobalException("Report not found", HttpStatus.NOT_FOUND));

        if (report.getStatus() != Status.PENDING) {
            throw new GlobalException("Report is already processed (Status: " + report.getStatus() + ")",
                    HttpStatus.FORBIDDEN);
        }

        report.setStatus(Status.REVIEWED);
    }

    @Transactional
    public void dismissReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new GlobalException("Report not found", HttpStatus.NOT_FOUND));

        if (report.getStatus() != Status.PENDING) {
            throw new GlobalException("Report is already processed (Status: " + report.getStatus() + ")",
                    HttpStatus.FORBIDDEN);
        }

        report.setStatus(Status.DISMISSED);
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
