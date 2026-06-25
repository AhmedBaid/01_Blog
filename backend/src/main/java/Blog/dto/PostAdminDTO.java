package Blog.dto;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostAdminDTO {
    private Long postId;
    private String content;
    private String description;
    private boolean isHidden;
    private String createdAt;

    private Long userId;
    private String avatar;
    private String firstname;
    private String lastname;

    public PostAdminDTO(Long postId, String content, String description, boolean isHidden, LocalDateTime createdAt,
            Long userId, String avatar, String firstname, String lastname) {
        this.postId = postId;
        this.content = content;
        this.description = description;
        this.isHidden = isHidden;

        if (createdAt != null) {
            this.createdAt = createdAt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        }

        this.userId = userId;
        this.avatar = avatar == null ? null : "http://localhost:8080/avatars/" + avatar;
        this.firstname = firstname;
        this.lastname = lastname;
    }
}