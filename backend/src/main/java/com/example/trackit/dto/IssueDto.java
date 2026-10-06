package com.example.trackit.dto;

import com.example.trackit.model.Issue;
import com.example.trackit.model.IssueStatus;
import com.example.trackit.model.IssueType;
import com.example.trackit.model.Priority;
import lombok.Data;

import java.time.Instant;

@Data
public class IssueDto {
    private Long id;
    private String key;
    private String title;
    private String description;
    private IssueType type;
    private IssueStatus status;
    private Priority priority;
    private Integer storyPoints;
    private int position;
    private Long projectId;
    private UserDto assignee;
    private UserDto reporter;
    private int commentCount;
    private Instant createdAt;
    private Instant updatedAt;

    public static IssueDto from(Issue issue) {
        IssueDto dto = new IssueDto();
        dto.setId(issue.getId());
        dto.setKey(issue.getKey());
        dto.setTitle(issue.getTitle());
        dto.setDescription(issue.getDescription());
        dto.setType(issue.getType());
        dto.setStatus(issue.getStatus());
        dto.setPriority(issue.getPriority());
        dto.setStoryPoints(issue.getStoryPoints());
        dto.setPosition(issue.getPosition());
        dto.setProjectId(issue.getProject().getId());
        dto.setAssignee(UserDto.from(issue.getAssignee()));
        dto.setReporter(UserDto.from(issue.getReporter()));
        dto.setCommentCount(issue.getComments().size());
        dto.setCreatedAt(issue.getCreatedAt());
        dto.setUpdatedAt(issue.getUpdatedAt());
        return dto;
    }
}
