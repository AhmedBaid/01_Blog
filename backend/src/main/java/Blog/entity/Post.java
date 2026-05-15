package Blog.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "posts")
@Data
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long postId;
    @ManyToOne
    private long userId;
    private String title;
    private String description;
    private boolean isHidden;
    private LocalDateTime createdAt;
}
