package Blog.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import Blog.entity.User;

@RestController
public class UserController {
    @GetMapping("/me")
    public User getCurrentUser(){
    
    }
}
