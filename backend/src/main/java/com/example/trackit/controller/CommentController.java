package com.example.trackit.controller;

import com.example.trackit.dto.CommentDto;
import com.example.trackit.dto.CommentRequest;
import com.example.trackit.model.Comment;
import com.example.trackit.model.Issue;
import com.example.trackit.model.User;
import com.example.trackit.repository.CommentRepository;
import com.example.trackit.service.IssueService;
import com.example.trackit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

// TODO: move logic to a CommentService like the others
@RestController
@RequestMapping("/api")
public class CommentController {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private IssueService issueService;

    @Autowired
    private UserService userService;

    @GetMapping("/issues/{issueId}/comments")
    public List<CommentDto> getComments(@PathVariable Long issueId) {
        issueService.getIssue(issueId); // checks access
        return commentRepository.findByIssueIdOrderByCreatedAtAsc(issueId).stream()
                .map(CommentDto::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/issues/{issueId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentDto addComment(@PathVariable Long issueId, @Valid @RequestBody CommentRequest req) {
        Issue issue = issueService.getIssue(issueId);
        Comment comment = new Comment();
        comment.setIssue(issue);
        comment.setAuthor(userService.getCurrentUser());
        comment.setContent(req.getContent());
        return CommentDto.from(commentRepository.save(comment));
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        User me = userService.getCurrentUser();
        if (!comment.getAuthor().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }
        commentRepository.delete(comment);
        return ResponseEntity.noContent().build();
    }
}
