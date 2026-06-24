package Blog.dto;

import lombok.Getter;

@Getter
public class ReportRequestDTO {
    private Long reportedUserId;
    private Long reportedPostId;
    private String reason;
}
