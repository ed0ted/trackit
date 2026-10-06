package com.example.trackit.dto;

import com.example.trackit.model.Role;
import lombok.Data;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;

@Data
public class AdminUserRequest {

    // only used when creating, username can't be changed after
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email is not valid")
    private String email;

    private String fullName;

    // optional when editing (empty = keep old password)
    private String password;

    private Role role;
}
