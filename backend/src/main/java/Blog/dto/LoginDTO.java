package Blog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDTO {
   @NotBlank(message = "email cannot be blank")
   private String email;
   @NotBlank(message = "password cannot be blank")
   private String password;
}
