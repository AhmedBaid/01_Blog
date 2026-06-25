package Blog.dto;

import Blog.enums.Role;
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
    private boolean FollowedByCurrentUser;
    private boolean status;
    private boolean isAdmin;

    public UserDTO(Long userId, String avatar, String firstname, String lastname, String username, String email,
            Role role, boolean status) {
        this.userId = userId;
        this.avatar = avatar == null ? null : "http://localhost:8080/avatars/" + avatar;
        this.firstname = firstname;
        this.lastname = lastname;
        this.username = username;
        this.email = email;
        this.isAdmin = role == Role.ADMIN;
        this.status = status;
    }
}
