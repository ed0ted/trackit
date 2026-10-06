package com.example.trackit.controller;

import com.example.trackit.dto.AuthResponse;
import com.example.trackit.dto.LoginRequest;
import com.example.trackit.dto.RegisterRequest;
import com.example.trackit.dto.UserDto;
import com.example.trackit.model.User;
import com.example.trackit.repository.UserRepository;
import com.example.trackit.security.JwtUtils;
import com.example.trackit.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
        } catch (AuthenticationException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong username or password");
        }
        User user = userRepository.findByUsername(req.getUsername()).get();
        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResponse(token, UserDto.from(user));
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByUsername(req.getUsername())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username is already taken");
        }
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already in use");
        }

        User user = new User(req.getUsername(), req.getEmail(), req.getFullName(),
                passwordEncoder.encode(req.getPassword()));
        if (user.getFullName() == null || user.getFullName().isBlank()) {
            user.setFullName(req.getUsername());
        }
        userRepository.save(user);

        String token = jwtUtils.generateToken(user.getUsername());
        return new AuthResponse(token, UserDto.from(user));
    }

    @GetMapping("/me")
    public UserDto me() {
        return UserDto.from(userService.getCurrentUser());
    }
}
