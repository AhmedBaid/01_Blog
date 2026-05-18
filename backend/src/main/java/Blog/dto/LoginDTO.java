package Blog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
   @NotBlank(message = "email or username cannot be blank")
   private String emailOrUsername;
   @NotBlank(message = "password cannot be blank")
   private String password;
}
