package com.example.trackit.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class AdminProjectRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String projectKey; // only for create
    private String description;
    private Long ownerId;
}
