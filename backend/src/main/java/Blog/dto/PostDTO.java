package Blog.dto;

import java.util.List;

import Blog.entity.Post;
import Blog.helpers.FormatTimeUtil;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class PostDTO {
    private Long id;
    private Long userId;
    private String title;
    private String description;
    private String username;
    private String firstname;
    private String lastname;
    private String avatar;
    private boolean likedByCurrentUser;
    private boolean itsMyPost;
    private List<String> mediaUrls;
    private String createdAt;
    private Long likeCount;
    private Long commentCount;

    public PostDTO(Post post, long likeCount, long commentCount, boolean likedByCurrentUser) {
        this.id = post.getPostId();
        this.title = post.getTitle();
        this.description = post.getDescription();
        this.userId = post.getUser().getUserId();
        this.username = post.getUser().getUsername();
        this.firstname = post.getUser().getFirstname();
        this.lastname = post.getUser().getLastname();
        this.avatar = post.getUser().getAvatar() == null ? null
                : "http://localhost:8080/avatars/" + post.getUser().getAvatar();
        this.createdAt = FormatTimeUtil.formatTimeAgo(post.getCreatedAt());
        this.mediaUrls = post.getMedias().stream().map(media -> "http://localhost:8080/posts/" + media).toList();

        this.likeCount = likeCount;
        this.commentCount = commentCount;
        this.likedByCurrentUser = likedByCurrentUser;
    }
}
