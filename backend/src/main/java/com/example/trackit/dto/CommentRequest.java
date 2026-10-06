package com.example.trackit.dto;

import lombok.Data;

import javax.validation.constraints.NotBlank;

@Data
public class CommentRequest {
    @NotBlank(message = "Comment can't be empty")
    private String content;
}
