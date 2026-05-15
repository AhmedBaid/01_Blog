package Blog.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstname;
    private String lastname;
    private String username;
    private String about;
    private LocalDateTime date;
    private Boolean status;
    private String email;
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;
}