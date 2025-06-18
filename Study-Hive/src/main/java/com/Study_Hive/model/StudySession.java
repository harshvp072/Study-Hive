package com.Study_Hive.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "study_sessions")
public class StudySession {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int durationInMinutes;

    @Column(nullable = false)
    private LocalDate studyDate;

    @Column(nullable = false)
    private String courseName;

    @Column
    private String description;

    // Many StudySessions can belong to one User
    // FetchType.LAZY is crucial for performance to avoid loading User data
    // unnecessarily when fetching StudySessions.
    // The DTO conversion will handle the serialization part.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false) // Foreign key column name
    private User user; // This represents the owner of the study session
}