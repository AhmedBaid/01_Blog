import java.util.Date;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    private String firstname;
    private String lastname;
    private String username;
    private String about;
    private Date date;
    private Boolean status;
    private String email;
    private String password;
    private Role role;
}
