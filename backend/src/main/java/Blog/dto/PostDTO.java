package Blog.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class PostDTO {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String username;
    private String firstname;
    private String lastname;
    private String avatar;
    private boolean isLikedByCurrentUser;
    private List<String> mediaUrls;
}
