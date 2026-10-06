package com.example.trackit.dto;

import com.example.trackit.model.Comment;
import lombok.Data;

import java.time.Instant;

@Data
public class CommentDto {
    private Long id;
    private String content;
    private UserDto author;
    private Instant createdAt;

    public static CommentDto from(Comment c) {
        CommentDto dto = new CommentDto();
        dto.setId(c.getId());
        dto.setContent(c.getContent());
        dto.setAuthor(UserDto.from(c.getAuthor()));
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
