package Blog.dto;

import lombok.Data;

@Data
public class CommentDTO {
    private Long commentId;
    private String content;
    private String createdAt;
    private Long userId;
    private String username;
    private String firstname;
    private String lastname;
    private String avatar;
    private boolean IsMine;
}