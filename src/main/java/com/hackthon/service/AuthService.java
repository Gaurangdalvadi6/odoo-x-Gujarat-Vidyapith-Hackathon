package com.hackthon.service;

import com.hackthon.dto.AuthDtos.AuthResponse;
import com.hackthon.dto.AuthDtos.LoginRequest;
import com.hackthon.dto.AuthDtos.RegisterRequest;
import com.hackthon.model.AppUser;
import com.hackthon.model.Enums;
import com.hackthon.repository.UserRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.BAD_REQUEST;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AppUserDetailsService userDetailsService;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(BAD_REQUEST, "Email already registered.");
        }
        AppUser user = new AppUser();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(Enums.UserRole.LEARNER);
        user.setTotalPoints(0);
        user.setBadgeLevel(Enums.BadgeLevel.NEWBIE);
        user = userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(Map.of("role", user.getRole().name()), userDetails);
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getTotalPoints(),
                user.getBadgeLevel(),
                token
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        AppUser user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Invalid credentials."));
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtService.generateToken(Map.of("role", user.getRole().name()), userDetails);
        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getTotalPoints(),
                user.getBadgeLevel(),
                token
        );
    }
}
