package Blog.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class UserDTO {
    private Long userId;
    private String username;
    private String email;
    private String firstname;
    private String lastname;
    private String bio;
    private Long followingCount;
    private Long followersCount;
    private Long postsCount;
    private String avatar;
    private String newToken;
}
