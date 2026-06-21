package Blog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CommentRequestDTO {
    @NotBlank(message = "Comment content cannot be empty")
    @Size(min = 3, max = 30, message = "Comment must be between 1 and 30 characters")
    private String content;
}