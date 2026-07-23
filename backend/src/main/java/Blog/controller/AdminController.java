package Blog.controller;

import Blog.dto.PostAdminDTO;
import Blog.dto.ReportDTO;
import Blog.dto.ResponseDTO;
import Blog.dto.AdminStatsDTO;
import Blog.dto.UserDTO;
import Blog.service.AdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(adminService.getAllUsersForAdmin(search.trim(), pageable));
        }
        return ResponseEntity.ok(adminService.getAllUsersForAdmin(pageable));
    }

    @PutMapping("/users/{userId}/ban")
    public ResponseEntity<ResponseDTO> toggleBanUser(@PathVariable Long userId) {
        boolean ban = adminService.toggleBanStatus(userId);
        return ResponseEntity
                .ok(ban ? new ResponseDTO("User banned successfully") : new ResponseDTO("User unbanned successfully"));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ResponseDTO> deleteUser(@PathVariable Long userId) {
        adminService.deleteUserPermanently(userId);
        return ResponseEntity.ok(new ResponseDTO("User account deleted permanently"));
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<PostAdminDTO>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(adminService.getAllPostsForAdmin(search.trim(), pageable));
        }
        return ResponseEntity.ok(adminService.getAllPostsForAdmin(pageable));
    }

    @PutMapping("/posts/{postId}/hide")
    public ResponseEntity<ResponseDTO> toggleHidePost(@PathVariable Long postId) {
        boolean hide = adminService.toggleHidePostStatus(postId);
        return ResponseEntity
                .ok(hide ? new ResponseDTO("Post hidden from feed") : new ResponseDTO("Post is now visible"));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<ResponseDTO> deletePost(@PathVariable Long postId) {
        adminService.deletePostPermanently(postId);
        return ResponseEntity.ok(new ResponseDTO("Post deleted successfully"));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getStats() {
        AdminStatsDTO stats = adminService.getStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/reports")
    public ResponseEntity<Page<ReportDTO>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(adminService.getAllReports(search.trim(), pageable));
        }
        return ResponseEntity.ok(adminService.getAllReports(pageable));
    }

    @PutMapping("/reports/{reportId}/review")
    public ResponseEntity<ResponseDTO> reviewReport(@PathVariable Long reportId) {
        adminService.reviewReport(reportId);
        return ResponseEntity.ok(new ResponseDTO("Report reviewed successfully"));
    }

    @PutMapping("/reports/{reportId}/dismiss")
    public ResponseEntity<ResponseDTO> dismissReport(@PathVariable Long reportId) {
        adminService.dismissReport(reportId);
        return ResponseEntity.ok(new ResponseDTO("Report dismissed successfully"));
    }
}