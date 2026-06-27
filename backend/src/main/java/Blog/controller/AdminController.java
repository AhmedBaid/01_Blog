package Blog.controller;

import Blog.dto.PostAdminDTO;
import Blog.dto.ResponseDTO;
import Blog.dto.AdminStatsDTO;
import Blog.dto.UserDTO;
import Blog.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
// @PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsersForAdmin());
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
    public ResponseEntity<List<PostAdminDTO>> getAllPosts() {
        return ResponseEntity.ok(adminService.getAllPostsForAdmin());
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
}