package com.hackthon.dto;

import com.hackthon.model.Enums;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public final class AuthDtos {
    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank String name,
            @Email @NotBlank String email,
            @NotBlank String password
    ) {
    }

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {
    }

    public record AuthResponse(
            Long userId,
            String name,
            String email,
            Enums.UserRole role,
            Integer totalPoints,
            Enums.BadgeLevel badgeLevel,
            String token
    ) {
    }
}
