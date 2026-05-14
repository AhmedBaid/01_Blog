import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class Users {
    @GetMapping
    public String test() {
        System.out.println("fefef");
        return "hello";
    }
}