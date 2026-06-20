package Blog.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LikeResponseDTO {
    private Long likeCount;
    private boolean likedByCurrentUser;
}
