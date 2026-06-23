package Blog.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class NotifDTO {
    private Long notifId;
    private Long userId;
    private String firstname;
    private String lastname;
    private String message;
    private String avatar;

    public NotifDTO(Long notifId,Long userId, String firstname, String lastname, String message, String avatar) {
        this.notifId = notifId;
        this.userId= userId;
        this.firstname = firstname;
        this.lastname = lastname;
        this.message = message;
        this.avatar = avatar == null ? null : "http://localhost:8080/avatars/" + avatar;
    }
}