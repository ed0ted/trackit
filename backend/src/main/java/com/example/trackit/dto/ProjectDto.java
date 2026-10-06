package com.example.trackit.dto;

import com.example.trackit.model.Project;
import lombok.Data;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ProjectDto {
    private Long id;
    private String name;
    private String projectKey;
    private String description;
    private UserDto owner;
    private List<UserDto> members;
    private int issueCount;
    private Instant createdAt;

    public static ProjectDto from(Project p) {
        ProjectDto dto = new ProjectDto();
        dto.setId(p.getId());
        dto.setName(p.getName());
        dto.setProjectKey(p.getProjectKey());
        dto.setDescription(p.getDescription());
        dto.setOwner(UserDto.from(p.getOwner()));
        dto.setMembers(p.getMembers().stream()
                .sorted(Comparator.comparing(u -> u.getUsername()))
                .map(UserDto::from)
                .collect(Collectors.toList()));
        dto.setIssueCount(p.getIssues().size());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
