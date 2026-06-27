package Blog.dto;

import Blog.enums.Status;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ReportDTO {
    private Long reportId;
    private String reason;
    private Status status;
    private String createdAt;

    private Long reporterId;
    private String reporterUsername;
    private String reporterFirstname;
    private String reporterLastname;
    private String reporterAvatar;

    private Long reportedUserId;
    private String reportedUsername;
    private String reportedFirstname;
    private String reportedLastname;
    private String reportedAvatar;

    private Long reportedPostId;
    private String reportedPostTitle;

    public ReportDTO(Long reportId, String reason, Status status, java.time.LocalDateTime createdAt,
            Long reporterId, String reporterUsername, String reporterFirstname, String reporterLastname,
            String reporterAvatar,
            Long reportedUserId, String reportedUsername, String reportedFirstname, String reportedLastname,
            String reportedAvatar,
            Long reportedPostId, String reportedPostTitle) {
        this.reportId = reportId;
        this.reason = reason;
        this.status = status;
        if (createdAt != null) {
            this.createdAt = createdAt.format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }
        this.reporterId = reporterId;
        this.reporterUsername = reporterUsername;
        this.reporterFirstname = reporterFirstname;
        this.reporterLastname = reporterLastname;
        this.reporterAvatar = reporterAvatar == null ? null : "http://localhost:8080/avatars/" + reporterAvatar;
        this.reportedUserId = reportedUserId;
        this.reportedUsername = reportedUsername;
        this.reportedFirstname = reportedFirstname;
        this.reportedLastname = reportedLastname;
        this.reportedAvatar = reportedAvatar == null ? null : "http://localhost:8080/avatars/" + reportedAvatar;
        this.reportedPostId = reportedPostId;
        this.reportedPostTitle = reportedPostTitle;
    }
}
