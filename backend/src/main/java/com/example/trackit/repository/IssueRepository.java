package com.example.trackit.repository;

import com.example.trackit.model.Issue;
import com.example.trackit.model.IssueStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IssueRepository extends JpaRepository<Issue, Long> {

    List<Issue> findByProjectIdOrderByPositionAsc(Long projectId);

    List<Issue> findByProjectIdAndStatusOrderByPositionAsc(Long projectId, IssueStatus status);

    int countByProjectIdAndStatus(Long projectId, IssueStatus status);

    List<Issue> findByAssigneeId(Long userId);

    List<Issue> findByReporterId(Long userId);

    List<Issue> findAllByOrderByProjectIdAscIssueNumberAsc();
}
