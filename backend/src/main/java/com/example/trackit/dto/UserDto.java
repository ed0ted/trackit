package com.example.trackit.dto;

import com.example.trackit.model.User;
import lombok.Data;

import java.time.Instant;

@Data
public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private Instant createdAt;

    public static UserDto from(User user) {
        if (user == null) return null;
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        // old users from before roles were added have null role
        dto.setRole(user.isAdmin() ? "ADMIN" : "USER");
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
