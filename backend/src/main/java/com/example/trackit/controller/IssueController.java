package com.example.trackit.controller;

import com.example.trackit.dto.IssueDto;
import com.example.trackit.dto.IssueRequest;
import com.example.trackit.dto.MoveIssueRequest;
import com.example.trackit.service.IssueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class IssueController {

    @Autowired
    private IssueService issueService;

    @GetMapping("/projects/{projectId}/issues")
    public List<IssueDto> getIssues(@PathVariable Long projectId) {
        return issueService.getProjectIssues(projectId).stream()
                .map(IssueDto::from)
                .collect(Collectors.toList());
    }

    @PostMapping("/projects/{projectId}/issues")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueDto createIssue(@PathVariable Long projectId, @Valid @RequestBody IssueRequest req) {
        return IssueDto.from(issueService.createIssue(projectId, req));
    }

    @GetMapping("/issues/{id}")
    public IssueDto getIssue(@PathVariable Long id) {
        return IssueDto.from(issueService.getIssue(id));
    }

    @PutMapping("/issues/{id}")
    public IssueDto updateIssue(@PathVariable Long id, @Valid @RequestBody IssueRequest req) {
        return IssueDto.from(issueService.updateIssue(id, req));
    }

    @PatchMapping("/issues/{id}/move")
    public IssueDto moveIssue(@PathVariable Long id, @Valid @RequestBody MoveIssueRequest req) {
        return IssueDto.from(issueService.moveIssue(id, req));
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        issueService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }
}
