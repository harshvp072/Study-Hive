package com.Study_Hive.repo;

import com.Study_Hive.model.StudySession;
import com.Study_Hive.model.User; // Import User
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    // Find sessions for a specific user within a date range
    List<StudySession> findByUserAndStudyDateBetween(User user, LocalDate start, LocalDate end);

    // Find sessions for a specific user by course name
    List<StudySession> findByUserAndCourseName(User user, String courseName);

    // Find all sessions for a specific user
    List<StudySession> findByUser(User user);
}