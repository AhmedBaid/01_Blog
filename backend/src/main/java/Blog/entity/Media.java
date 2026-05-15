package Blog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "media")
public class Media {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long mediaId;
    @ManyToOne
    private long postId;
    private String mediaName;
}
