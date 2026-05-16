package Blog.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class Users {
    @GetMapping("/login")
    public String sayHello() {
        return "Hello, Spring Boot!";
    }

    @PostMapping("/hi")
    public String sayHi() {
        return "hi, Spring Boot!";
    }
}