package com.example.trackit.repository;

import com.example.trackit.model.Project;
import com.example.trackit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByMembersContainingOrderByCreatedAtDesc(User user);

    boolean existsByProjectKey(String projectKey);

    List<Project> findByOwnerId(Long userId);
}
