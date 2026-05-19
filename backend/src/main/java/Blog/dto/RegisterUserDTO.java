package Blog.dto;

import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class RegisterUserDTO {
    @Size(min = 5, max = 15, message = "Firstname must be between 5 and 15 characters")
    @NotBlank(message = "Firstname cannot be blank")
    private String firstname;

    @Size(min = 5, max = 15, message = "Lastname must be between 5 and 15 characters")
    @NotBlank(message = "Lastname cannot be blank")
    private String lastname;

    @Size(min = 5, max = 15, message = "Username must be between 5 and 15 characters")
    @NotBlank(message = "Username cannot be blank")
    private String username;

    @Size(min = 8, max = 30, message = "Email must be between 8 and 30 characters")
    @NotBlank(message = "Email cannot be blank")
    @Email(regexp = "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}", flags = Pattern.Flag.CASE_INSENSITIVE, message = "Email is not valid")
    private String email;

    @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
    @NotBlank(message = "Password cannot be blank")
    private String password;

    @Size(min = 10, max = 100, message = "Bio must be between 10 and 100 characters")
    @NotBlank(message = "Bio cannot be blank")
    private String bio;

    private MultipartFile avatar;
}
