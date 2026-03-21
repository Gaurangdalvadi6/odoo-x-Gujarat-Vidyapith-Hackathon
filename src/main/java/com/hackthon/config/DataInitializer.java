package com.hackthon.config;

import com.hackthon.model.AppUser;
import com.hackthon.model.Enums;
import com.hackthon.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedUsers() {
        return args -> {
            if (userRepository.count() > 0) {
                return;
            }
            userRepository.save(build("Admin User", "admin@learnova.com", Enums.UserRole.ADMIN));
            userRepository.save(build("Instructor One", "instructor@learnova.com", Enums.UserRole.INSTRUCTOR));
            userRepository.save(build("Learner One", "learner@learnova.com", Enums.UserRole.LEARNER));
        };
    }

    private AppUser build(String name, String email, Enums.UserRole role) {
        AppUser user = new AppUser();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setTotalPoints(0);
        user.setBadgeLevel(Enums.BadgeLevel.NEWBIE);
        return user;
    }
}
