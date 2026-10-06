package com.example.trackit.service;

import com.example.trackit.dto.ProjectRequest;
import com.example.trackit.model.Issue;
import com.example.trackit.model.Project;
import com.example.trackit.model.User;
import com.example.trackit.repository.ProjectRepository;
import com.example.trackit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    public List<Project> getMyProjects() {
        User me = userService.getCurrentUser();
        return projectRepository.findByMembersContainingOrderByCreatedAtDesc(me);
    }

    // gets project and checks that current user is a member
    public Project getProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Project not found"));
        User me = userService.getCurrentUser();
        if (!project.hasMember(me)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You are not a member of this project");
        }
        return project;
    }

    @Transactional
    public Project createProject(ProjectRequest req) {
        String key = req.getProjectKey().toUpperCase();
        if (projectRepository.existsByProjectKey(key)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Project key " + key + " is already taken");
        }
        User me = userService.getCurrentUser();

        Project project = new Project();
        project.setName(req.getName());
        project.setProjectKey(key);
        project.setDescription(req.getDescription());
        project.setOwner(me);
        project.getMembers().add(me);
        return projectRepository.save(project);
    }

    @Transactional
    public Project updateProject(Long id, ProjectRequest req) {
        Project project = getProject(id);
        project.setName(req.getName());
        project.setDescription(req.getDescription());
        // NOTE: key can't be changed because then all the issue keys would change
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        Project project = getProject(id);
        User me = userService.getCurrentUser();
        if (!project.getOwner().getId().equals(me.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the project owner can delete it");
        }
        projectRepository.delete(project);
    }

    @Transactional
    public Project addMember(Long projectId, String username) {
        Project project = getProject(projectId);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No user with username " + username));
        if (project.hasMember(user)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, username + " is already in the project");
        }
        project.getMembers().add(user);
        return projectRepository.save(project);
    }

    @Transactional
    public Project removeMember(Long projectId, Long userId) {
        Project project = getProject(projectId);
        if (project.getOwner().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Can't remove the project owner");
        }
        project.getMembers().removeIf(u -> u.getId().equals(userId));
        // unassign their issues
        for (Issue issue : project.getIssues()) {
            if (issue.getAssignee() != null && issue.getAssignee().getId().equals(userId)) {
                issue.setAssignee(null);
            }
        }
        return projectRepository.save(project);
    }
}
