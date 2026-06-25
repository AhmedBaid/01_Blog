package Blog.config;

import Blog.entity.User;
import Blog.enums.Role;
import Blog.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class MakeAdmin {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    public MakeAdmin(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    @Bean
    public CommandLineRunner makeAdminSeeder() {
        return args -> {
            if (userRepository.existsByUsername("admin")) {
                return;
            }

            User admin = new User();
            admin.setFirstname("admin");
            admin.setLastname("admin");
            admin.setUsername("admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setBio("administrator ajmii");
            admin.setAvatar("admin.jpeg");
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);
            System.out.println(">> Admin user created successfully (username: admin)!");
        };
    }
}