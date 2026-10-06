package com.example.trackit.controller;

import com.example.trackit.dto.*;
import com.example.trackit.repository.CommentRepository;
import com.example.trackit.repository.IssueRepository;
import com.example.trackit.repository.ProjectRepository;
import com.example.trackit.repository.UserRepository;
import com.example.trackit.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

// everything here needs ROLE_ADMIN (see SecurityConfig)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private IssueRepository issueRepository;
    @Autowired
    private CommentRepository commentRepository;

    @GetMapping("/stats")
    public AdminStats stats() {
        return new AdminStats(userRepository.count(), projectRepository.count(),
                issueRepository.count(), commentRepository.count());
    }

    // ----- users -----

    @GetMapping("/users")
    public List<UserDto> getUsers() {
        return adminService.getAllUsers().stream().map(UserDto::from).collect(Collectors.toList());
    }

    @PostMapping("/users")
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@Valid @RequestBody AdminUserRequest req) {
        return UserDto.from(adminService.createUser(req));
    }

    @PutMapping("/users/{id}")
    public UserDto updateUser(@PathVariable Long id, @Valid @RequestBody AdminUserRequest req) {
        return UserDto.from(adminService.updateUser(id, req));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    // ----- projects -----

    @GetMapping("/projects")
    public List<ProjectDto> getProjects() {
        return adminService.getAllProjects().stream().map(ProjectDto::from).collect(Collectors.toList());
    }

    @PostMapping("/projects")
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDto createProject(@Valid @RequestBody AdminProjectRequest req) {
        return ProjectDto.from(adminService.createProject(req));
    }

    @PutMapping("/projects/{id}")
    public ProjectDto updateProject(@PathVariable Long id, @Valid @RequestBody AdminProjectRequest req) {
        return ProjectDto.from(adminService.updateProject(id, req));
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        adminService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    // ----- issues -----

    @GetMapping("/issues")
    public List<IssueDto> getIssues() {
        return adminService.getAllIssues().stream().map(IssueDto::from).collect(Collectors.toList());
    }

    @PostMapping("/projects/{projectId}/issues")
    @ResponseStatus(HttpStatus.CREATED)
    public IssueDto createIssue(@PathVariable Long projectId, @Valid @RequestBody IssueRequest req) {
        return IssueDto.from(adminService.createIssue(projectId, req));
    }

    @PutMapping("/issues/{id}")
    public IssueDto updateIssue(@PathVariable Long id, @Valid @RequestBody IssueRequest req) {
        return IssueDto.from(adminService.updateIssue(id, req));
    }

    @DeleteMapping("/issues/{id}")
    public ResponseEntity<?> deleteIssue(@PathVariable Long id) {
        adminService.deleteIssue(id);
        return ResponseEntity.noContent().build();
    }

    // ----- comments -----

    @GetMapping("/comments")
    public List<AdminCommentDto> getComments() {
        return adminService.getAllComments().stream().map(AdminCommentDto::from).collect(Collectors.toList());
    }

    @DeleteMapping("/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id) {
        adminService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
