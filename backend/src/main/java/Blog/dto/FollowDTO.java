package Blog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class FollowDTO {
    private Long userId;
    private String avatar;
    private String firstname;
    private String lastname;
    private String username;

    public FollowDTO(Long userId, String avatar, String firstname, String lastname, String username) {
        this.userId = userId;
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.avatar = avatar == null ? null : "http://localhost:8080/avatars/" + avatar;
    }
}