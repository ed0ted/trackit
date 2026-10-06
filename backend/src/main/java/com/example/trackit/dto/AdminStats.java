package com.example.trackit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminStats {
    private long users;
    private long projects;
    private long issues;
    private long comments;
}
