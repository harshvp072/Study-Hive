package com.Study_Hive.dto;
import lombok.Data;
import java.time.LocalDate;

@Data
public class StudySessionDto {
    private Long id;
    private int durationInMinutes;
    private LocalDate studyDate;
    private String courseName;
    private String description;
    private Long userId;
    private String username;
}