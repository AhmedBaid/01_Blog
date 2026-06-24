package Blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ReportRequestDTO {
    private Long reportedUserId;
    private Long reportedPostId;
    @Size(min = 4, max = 30, message = "Reason must be between 4 and 30 characters")
    @NotBlank(message = "Title cannot be blank")
    private String reason;
}
