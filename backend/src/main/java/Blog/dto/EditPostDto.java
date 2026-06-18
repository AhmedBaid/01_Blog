package Blog.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class EditPostDto {
    @Size(min = 5, max = 15, message = "Title must be between 5 and 15 characters")
    @NotBlank(message = "Title cannot be blank")
    private String title;

    @Size(min = 10, max = 30, message = "Description must be between 10 and 30 characters")
    @NotBlank(message = "Description cannot be blank")
    private String description;

    private List<MultipartFile> medias;
}
