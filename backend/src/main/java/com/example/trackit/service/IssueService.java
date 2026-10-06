package com.example.trackit.service;

import com.example.trackit.dto.IssueRequest;
import com.example.trackit.dto.MoveIssueRequest;
import com.example.trackit.model.*;
import com.example.trackit.repository.IssueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class IssueService {

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    public List<Issue> getProjectIssues(Long projectId) {
        projectService.getProject(projectId); // access check
        return issueRepository.findByProjectIdOrderByPositionAsc(projectId);
    }

    public Issue getIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
        projectService.getProject(issue.getProject().getId()); // throws if no access
        return issue;
    }

    @Transactional
    public Issue createIssue(Long projectId, IssueRequest req) {
        Project project = projectService.getProject(projectId);
        User me = userService.getCurrentUser();

        project.setIssueCounter(project.getIssueCounter() + 1);

        Issue issue = new Issue();
        issue.setProject(project);
        issue.setIssueNumber(project.getIssueCounter());
        issue.setTitle(req.getTitle());
        issue.setDescription(req.getDescription());
        issue.setReporter(me);
        if (req.getType() != null) issue.setType(req.getType());
        if (req.getPriority() != null) issue.setPriority(req.getPriority());
        if (req.getStatus() != null) issue.setStatus(req.getStatus());
        issue.setStoryPoints(req.getStoryPoints());
        issue.setAssignee(findAssignee(project, req.getAssigneeId()));

        // put it at the bottom of the column
        issue.setPosition(issueRepository.countByProjectIdAndStatus(projectId, issue.getStatus()));

        return issueRepository.save(issue);
    }

    @Transactional
    public Issue updateIssue(Long id, IssueRequest req) {
        Issue issue = getIssue(id);

        issue.setTitle(req.getTitle());
        issue.setDescription(req.getDescription());
        if (req.getType() != null) issue.setType(req.getType());
        if (req.getPriority() != null) issue.setPriority(req.getPriority());
        issue.setStoryPoints(req.getStoryPoints());
        issue.setAssignee(findAssignee(issue.getProject(), req.getAssigneeId()));

        if (req.getStatus() != null && req.getStatus() != issue.getStatus()) {
            // status changed from the modal -> move to end of new column
            int pos = issueRepository.countByProjectIdAndStatus(issue.getProject().getId(), req.getStatus());
            issue.setStatus(req.getStatus());
            issue.setPosition(pos);
        }

        return issueRepository.save(issue);
    }

    // called when a card is dragged on the board
    @Transactional
    public Issue moveIssue(Long id, MoveIssueRequest req) {
        Issue issue = getIssue(id);
        Long projectId = issue.getProject().getId();
        IssueStatus oldStatus = issue.getStatus();

        List<Issue> target = issueRepository.findByProjectIdAndStatusOrderByPositionAsc(projectId, req.getStatus());
        target.removeIf(i -> i.getId().equals(issue.getId()));

        int newPos = Math.max(0, Math.min(req.getPosition(), target.size()));
        target.add(newPos, issue);
        issue.setStatus(req.getStatus());

        for (int i = 0; i < target.size(); i++) {
            target.get(i).setPosition(i);
        }

        // fix the positions in the old column too
        if (oldStatus != req.getStatus()) {
            List<Issue> source = issueRepository.findByProjectIdAndStatusOrderByPositionAsc(projectId, oldStatus);
            source.removeIf(i -> i.getId().equals(issue.getId()));
            for (int i = 0; i < source.size(); i++) {
                source.get(i).setPosition(i);
            }
        }

        return issue;
    }

    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = getIssue(id);
        issue.getProject().getIssues().remove(issue);
        issueRepository.delete(issue);
    }

    private User findAssignee(Project project, Long assigneeId) {
        if (assigneeId == null) return null;
        User user = userService.getById(assigneeId);
        if (!project.hasMember(user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee must be a project member");
        }
        return user;
    }
}
