package com.example.trackit.controller;

import com.example.trackit.dto.AddMemberRequest;
import com.example.trackit.dto.ProjectDto;
import com.example.trackit.dto.ProjectRequest;
import com.example.trackit.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public List<ProjectDto> getProjects() {
        return projectService.getMyProjects().stream()
                .map(ProjectDto::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ProjectDto getProject(@PathVariable Long id) {
        return ProjectDto.from(projectService.getProject(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDto createProject(@Valid @RequestBody ProjectRequest req) {
        return ProjectDto.from(projectService.createProject(req));
    }

    @PutMapping("/{id}")
    public ProjectDto updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest req) {
        return ProjectDto.from(projectService.updateProject(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/members")
    public ProjectDto addMember(@PathVariable Long id, @RequestBody AddMemberRequest req) {
        return ProjectDto.from(projectService.addMember(id, req.getUsername()));
    }

    @DeleteMapping("/{id}/members/{userId}")
    public ProjectDto removeMember(@PathVariable Long id, @PathVariable Long userId) {
        return ProjectDto.from(projectService.removeMember(id, userId));
    }
}
