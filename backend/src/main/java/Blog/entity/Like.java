package Blog.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "likes")
@Data
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long likeId;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User userId;
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post postId;
}
