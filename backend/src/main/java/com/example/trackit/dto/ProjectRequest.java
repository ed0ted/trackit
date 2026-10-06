package com.example.trackit.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

@Data
public class ProjectRequest {

    @NotBlank(message = "Project name is required")
    private String name;

    @NotBlank(message = "Key is required")
    @Size(min = 2, max = 10, message = "Key must be 2-10 characters")
    @Pattern(regexp = "^[A-Za-z]+$", message = "Key can only contain letters")
    private String projectKey;

    private String description;
}
