package com.example.trackit.dto;

import com.example.trackit.model.IssueStatus;
import lombok.Data;

import javax.validation.constraints.NotNull;

@Data
public class MoveIssueRequest {
    @NotNull
    private IssueStatus status;
    private int position;
}
