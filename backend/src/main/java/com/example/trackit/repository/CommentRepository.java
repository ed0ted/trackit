package com.example.trackit.repository;

import com.example.trackit.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByIssueIdOrderByCreatedAtAsc(Long issueId);

    List<Comment> findByAuthorId(Long userId);

    List<Comment> findAllByOrderByCreatedAtDesc();
}
