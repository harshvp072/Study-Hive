package com.Study_Hive.repo;

import com.Study_Hive.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByStudyDateBetween(LocalDate start, LocalDate end);
    List<StudySession> findByCourseName(String courseName);
}