package com.Study_Hive.controller;

import com.Study_Hive.model.StudySession;
import com.Study_Hive.dto.StudySessionDto; // Import StudySessionDto
import com.Study_Hive.service.StudyTrackerService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class StudyTrackerController {
    private final StudyTrackerService service;

    public StudyTrackerController(StudyTrackerService service) {
        this.service = service;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> getDashboardData() {
        return service.getDashboardDataForCurrentUser();
    }

    @PostMapping("/sessions")
    public StudySessionDto addSession(@RequestBody StudySession session) { // Expect StudySession, return DTO
        return service.saveSession(session);
    }

    @GetMapping("/sessions")
    public List<StudySessionDto> getAllSessions() { // Return List of DTOs
        return service.getAllSessionsForCurrentUser();
    }
}