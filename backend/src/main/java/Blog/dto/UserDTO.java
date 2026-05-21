package Blog.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
@Getter
public class UserDTO {
    private String username;
    private String email;
    private String firstname;
    private String lastname;
    private String bio;
    private Long followingCount;
    private Long followersCount;
    private String avatar;
}
