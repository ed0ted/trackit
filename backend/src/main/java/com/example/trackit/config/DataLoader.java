package com.example.trackit.config;

import com.example.trackit.model.*;
import com.example.trackit.repository.IssueRepository;
import com.example.trackit.repository.ProjectRepository;
import com.example.trackit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Adds some demo data when the database is empty so the board isn't blank
 * the first time you start the app.
 * login: demo / demo123
 */
@Component
public class DataLoader implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private IssueRepository issueRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // admin is created separately so it also gets added to an existing database
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User("admin", "admin@trackit.dev", "Administrator", passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            System.out.println(">>> Created admin user (admin / admin123)");
        }

        if (userRepository.existsByUsername("demo")) {
            return;
        }
        System.out.println(">>> Empty database, inserting demo data");

        User demo = userRepository.save(new User("demo", "demo@trackit.dev", "Demo User", passwordEncoder.encode("demo123")));
        User anna = userRepository.save(new User("anna", "anna@trackit.dev", "Anna Kask", passwordEncoder.encode("anna123")));
        User mark = userRepository.save(new User("mark", "mark@trackit.dev", "Mark Tamm", passwordEncoder.encode("mark123")));

        Project p = new Project();
        p.setName("TrackIt Development");
        p.setProjectKey("TRK");
        p.setDescription("Building the TrackIt app itself (team project for the software engineering course)");
        p.setOwner(demo);
        p.getMembers().add(demo);
        p.getMembers().add(anna);
        p.getMembers().add(mark);
        p = projectRepository.save(p);

        addIssue(p, "Set up Spring Boot project and database", IssueType.TASK, IssueStatus.DONE, Priority.HIGH, demo, demo, 2);
        addIssue(p, "Login and register with JWT", IssueType.STORY, IssueStatus.DONE, Priority.HIGHEST, demo, demo, 5);
        addIssue(p, "Kanban board with drag and drop", IssueType.STORY, IssueStatus.IN_REVIEW, Priority.HIGH, anna, demo, 8);
        addIssue(p, "Issue details popup", IssueType.STORY, IssueStatus.IN_PROGRESS, Priority.MEDIUM, anna, demo, 5);
        addIssue(p, "Board does not refresh after deleting issue", IssueType.BUG, IssueStatus.IN_PROGRESS, Priority.HIGH, mark, anna, 1);
        addIssue(p, "Add comments to issues", IssueType.TASK, IssueStatus.TODO, Priority.MEDIUM, mark, demo, 3);
        addIssue(p, "Project settings page (members)", IssueType.TASK, IssueStatus.TODO, Priority.LOW, null, demo, 3);
        addIssue(p, "Search and filter on the board", IssueType.STORY, IssueStatus.TODO, Priority.MEDIUM, demo, anna, 3);
        addIssue(p, "Long titles overflow on the card", IssueType.BUG, IssueStatus.TODO, Priority.LOWEST, null, mark, null);
        addIssue(p, "Write README and presentation", IssueType.TASK, IssueStatus.TODO, Priority.LOW, null, demo, 2);

        Project p2 = new Project();
        p2.setName("Website Redesign");
        p2.setProjectKey("WEB");
        p2.setDescription("New landing page for the student club");
        p2.setOwner(anna);
        p2.getMembers().add(anna);
        p2.getMembers().add(demo);
        p2 = projectRepository.save(p2);

        addIssue(p2, "Collect content from the board members", IssueType.TASK, IssueStatus.TODO, Priority.MEDIUM, anna, anna, null);
        addIssue(p2, "Figma mockups for home page", IssueType.STORY, IssueStatus.IN_PROGRESS, Priority.HIGH, demo, anna, 5);
    }

    private void addIssue(Project p, String title, IssueType type, IssueStatus status, Priority priority,
                          User assignee, User reporter, Integer points) {
        p.setIssueCounter(p.getIssueCounter() + 1);
        Issue issue = new Issue();
        issue.setProject(p);
        issue.setIssueNumber(p.getIssueCounter());
        issue.setTitle(title);
        issue.setType(type);
        issue.setStatus(status);
        issue.setPriority(priority);
        issue.setAssignee(assignee);
        issue.setReporter(reporter);
        issue.setStoryPoints(points);
        issue.setPosition(issueRepository.countByProjectIdAndStatus(p.getId(), status));
        issueRepository.save(issue);
    }
}
