package com.example.trackit.service;

import com.example.trackit.dto.AdminProjectRequest;
import com.example.trackit.dto.AdminUserRequest;
import com.example.trackit.dto.IssueRequest;
import com.example.trackit.model.*;
import com.example.trackit.repository.CommentRepository;
import com.example.trackit.repository.IssueRepository;
import com.example.trackit.repository.ProjectRepository;
import com.example.trackit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin stuff. Same as the normal services but without the "is member of project" checks.
 * (access to /api/admin/** is checked in SecurityConfig)
 */
@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private IssueRepository issueRepository;
    @Autowired
    private CommentRepository commentRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private PasswordEncoder passwordEncoder;

    // ---------------- users ----------------

    public List<User> getAllUsers() {
        return userRepository.findAll(Sort.by("id"));
    }

    @Transactional
    public User createUser(AdminUserRequest req) {
        if (req.getUsername() == null || req.getUsername().trim().length() < 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be at least 3 characters");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
        }
        if (userRepository.existsByUsername(req.getUsername().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
        }
        User user = new User(req.getUsername().trim(), req.getEmail(), req.getFullName(), passwordEncoder.encode(req.getPassword()));
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(user.getUsername());
        }
        user.setRole(req.getRole() != null ? req.getRole() : Role.USER);
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, AdminUserRequest req) {
        User user = userService.getById(id);
        User me = userService.getCurrentUser();

        if (!req.getEmail().equals(user.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
        }
        if (me.getId().equals(id) && req.getRole() == Role.USER) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can't remove admin role from yourself");
        }

        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        if (req.getRole() != null) {
            user.setRole(req.getRole());
        }
        if (req.getPassword() != null && !req.getPassword().isEmpty()) {
            if (req.getPassword().length() < 6) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(req.getPassword()));
        }
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User me = userService.getCurrentUser();
        if (me.getId().equals(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can't delete yourself");
        }
        User user = userService.getById(id);

        List<Project> owned = projectRepository.findByOwnerId(id);
        if (!owned.isEmpty()) {
            String keys = owned.stream().map(Project::getProjectKey).collect(Collectors.joining(", "));
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "User owns projects (" + keys + "). Change the owner or delete them first");
        }

        // clean up everything that points to this user
        for (Issue issue : issueRepository.findByAssigneeId(id)) {
            issue.setAssignee(null);
        }
        for (Issue issue : issueRepository.findByReporterId(id)) {
            issue.setReporter(null);
        }
        commentRepository.deleteAll(commentRepository.findByAuthorId(id));
        for (Project p : projectRepository.findByMembersContainingOrderByCreatedAtDesc(user)) {
            p.getMembers().removeIf(m -> m.getId().equals(id));
        }

        userRepository.delete(user);
    }

    // ---------------- projects ----------------

    public List<Project> getAllProjects() {
        return projectRepository.findAll(Sort.by("id"));
    }

    @Transactional
    public Project createProject(AdminProjectRequest req) {
        if (req.getProjectKey() == null || !req.getProjectKey().matches("^[A-Za-z]{2,10}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Key must be 2-10 letters");
        }
        String key = req.getProjectKey().toUpperCase();
        if (projectRepository.existsByProjectKey(key)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project key " + key + " is already taken");
        }
        User owner = req.getOwnerId() != null ? userService.getById(req.getOwnerId()) : userService.getCurrentUser();

        Project project = new Project();
        project.setName(req.getName());
        project.setProjectKey(key);
        project.setDescription(req.getDescription());
        project.setOwner(owner);
        project.getMembers().add(owner);
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, AdminProjectRequest req) {
        Project project = getProject(id);
        project.setName(req.getName());
        project.setDescription(req.getDescription());
        if (req.getOwnerId() != null && !req.getOwnerId().equals(project.getOwner().getId())) {
            User newOwner = userService.getById(req.getOwnerId());
            project.setOwner(newOwner);
            // owner has to be a member too
            if (!project.hasMember(newOwner)) {
                project.getMembers().add(newOwner);
            }
        }
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        projectRepository.delete(getProject(id));
    }

    private Project getProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
    }

    // ---------------- issues ----------------

    public List<Issue> getAllIssues() {
        return issueRepository.findAllByOrderByProjectIdAscIssueNumberAsc();
    }

    @Transactional
    public Issue createIssue(Long projectId, IssueRequest req) {
        Project project = getProject(projectId);
        project.setIssueCounter(project.getIssueCounter() + 1);

        Issue issue = new Issue();
        issue.setProject(project);
        issue.setIssueNumber(project.getIssueCounter());
        issue.setReporter(userService.getCurrentUser());
        issue.setTitle(req.getTitle());
        issue.setDescription(req.getDescription());
        if (req.getType() != null) issue.setType(req.getType());
        if (req.getPriority() != null) issue.setPriority(req.getPriority());
        if (req.getStatus() != null) issue.setStatus(req.getStatus());
        issue.setStoryPoints(req.getStoryPoints());
        issue.setAssignee(req.getAssigneeId() != null ? userService.getById(req.getAssigneeId()) : null);
        issue.setPosition(issueRepository.countByProjectIdAndStatus(projectId, issue.getStatus()));
        return issueRepository.save(issue);
    }

    @Transactional
    public Issue updateIssue(Long id, IssueRequest req) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
        issue.setTitle(req.getTitle());
        if (req.getDescription() != null) issue.setDescription(req.getDescription());
        if (req.getType() != null) issue.setType(req.getType());
        if (req.getPriority() != null) issue.setPriority(req.getPriority());
        issue.setStoryPoints(req.getStoryPoints());

        if (req.getAssigneeId() != null) {
            User assignee = userService.getById(req.getAssigneeId());
            if (!issue.getProject().hasMember(assignee)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Assignee must be a member of the project");
            }
            issue.setAssignee(assignee);
        } else {
            issue.setAssignee(null);
        }

        if (req.getStatus() != null && req.getStatus() != issue.getStatus()) {
            issue.setPosition(issueRepository.countByProjectIdAndStatus(issue.getProject().getId(), req.getStatus()));
            issue.setStatus(req.getStatus());
        }
        return issueRepository.save(issue);
    }

    @Transactional
    public void deleteIssue(Long id) {
        Issue issue = issueRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Issue not found"));
        issue.getProject().getIssues().remove(issue);
        issueRepository.delete(issue);
    }

    // ---------------- comments ----------------

    public List<Comment> getAllComments() {
        return commentRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public void deleteComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        commentRepository.delete(comment);
    }
}
