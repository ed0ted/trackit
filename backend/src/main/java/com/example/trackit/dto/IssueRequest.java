package com.example.trackit.dto;

import com.example.trackit.model.IssueStatus;
import com.example.trackit.model.IssueType;
import com.example.trackit.model.Priority;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Data
public class IssueRequest {

    @NotBlank(message = "Summary can't be empty")
    @Size(max = 255)
    private String title;

    private String description;
    private IssueType type;
    private IssueStatus status;
    private Priority priority;
    private Integer storyPoints;
    private Long assigneeId;
}
