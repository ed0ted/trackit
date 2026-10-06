package com.example.trackit.controller;

import com.example.trackit.dto.IssueDto;
import com.example.trackit.dto.UserDto;
import com.example.trackit.model.User;
import com.example.trackit.repository.IssueRepository;
import com.example.trackit.repository.UserRepository;
import com.example.trackit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private IssueRepository issueRepository;

    @Autowired
    private UserService userService;

    // used for the "add member" search
    @GetMapping
    public List<UserDto> searchUsers(@RequestParam(required = false, defaultValue = "") String q) {
        List<User> users;
        if (q.isEmpty()) {
            users = userRepository.findAll();
        } else {
            users = userRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(q, q);
        }
        return users.stream().limit(20).map(UserDto::from).collect(Collectors.toList());
    }

    // issues assigned to me across all projects ("Your work" page)
    @GetMapping("/me/issues")
    public List<IssueDto> myIssues() {
        User me = userService.getCurrentUser();
        return issueRepository.findByAssigneeId(me.getId()).stream()
                .filter(i -> i.getProject().hasMember(me))
                .map(IssueDto::from)
                .collect(Collectors.toList());
    }
}
