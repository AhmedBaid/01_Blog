package Blog.controller;

import org.springframework.web.bind.annotation.*;

@RestController
public class Users {
    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, Spring Boot!";
    }

    @PostMapping("/hi")
    public String sayHi() {
        return "hi, Spring Boot!";
    }
}