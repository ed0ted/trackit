package com.example.trackit.dto;

import com.example.trackit.model.Comment;
import lombok.Data;

// comment with the issue key, so the admin table knows where it belongs
@Data
public class AdminCommentDto {
    private Long id;
    private String content;
    private String authorUsername;
    private String issueKey;
    private Long issueId;
    private String createdAt;

    public static AdminCommentDto from(Comment c) {
        AdminCommentDto dto = new AdminCommentDto();
        dto.setId(c.getId());
        dto.setContent(c.getContent());
        dto.setAuthorUsername(c.getAuthor() != null ? c.getAuthor().getUsername() : null);
        dto.setIssueKey(c.getIssue().getKey());
        dto.setIssueId(c.getIssue().getId());
        dto.setCreatedAt(c.getCreatedAt().toString());
        return dto;
    }
}
