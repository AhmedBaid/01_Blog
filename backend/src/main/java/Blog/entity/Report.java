package Blog.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import Blog.enums.Status;
import jakarta.persistence.*;

@Entity
@Table(name = "reports")
public class Report {
    private long reportId;
    private long reporterId;
    private long reportedUserId;
    private String reason;
    @Enumerated(EnumType.STRING)
    private Status status;
    @CreationTimestamp
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;
}
