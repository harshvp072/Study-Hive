package com.Study_Hive.service;

import com.Study_Hive.model.StudySession;
import com.Study_Hive.model.User;
import com.Study_Hive.repo.StudySessionRepository;
import com.Study_Hive.dto.StudySessionDto; // Import StudySessionDto
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.hibernate.Hibernate; // Import Hibernate for explicit initialization

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors; // For stream operations

@Service
public class StudyTrackerService {
    private final StudySessionRepository repository;
    private final HttpSession httpSession;

    @Autowired
    public StudyTrackerService(StudySessionRepository repository, HttpSession httpSession) {
        this.repository = repository;
        this.httpSession = httpSession;
    }

    // Helper method to get the current logged-in user from the session
    private User getCurrentUser() {
        // IMPORTANT: In a production environment with Spring Security, you would typically
        // retrieve the user from SecurityContextHolder. This approach is for simplicity
        // given your current setup.
        Object userObj = httpSession.getAttribute("user");
        if (userObj instanceof User) {
            return (User) userObj;
        }
        // Throw an exception if no user is found in the session
        throw new IllegalStateException("User not logged in or session invalid.");
    }

    // Helper method to convert StudySession entity to StudySessionDto
    private StudySessionDto convertToDto(StudySession session) {
        StudySessionDto dto = new StudySessionDto();
        dto.setId(session.getId());
        dto.setDurationInMinutes(session.getDurationInMinutes());
        dto.setStudyDate(session.getStudyDate());
        dto.setCourseName(session.getCourseName());
        dto.setDescription(session.getDescription());
        if (session.getUser() != null) {
            dto.setUserId(session.getUser().getId());
            dto.setUsername(session.getUser().getUsername()); // Include username for display
        }
        return dto;
    }

    public StudySessionDto saveSession(StudySession session) {
        User currentUser = getCurrentUser();
        session.setUser(currentUser); // Associate the session with the current user
        System.out.println("Saving session for user " + currentUser.getEmail() + ": " + session);
        StudySession savedSession = repository.save(session);
        return convertToDto(savedSession); // Return the DTO
    }

    public List<StudySessionDto> getAllSessionsForCurrentUser() { // Return List of DTOs
        User currentUser = getCurrentUser();
        List<StudySession> sessions = repository.findByUser(currentUser);
        // No need to explicitly initialize 'user' here because we are mapping to DTO
        // and only accessing 'user.getId()' and 'user.getUsername()' which would be
        // available if the User object was already loaded into the session or if
        // the proxy can resolve those basic properties. For robustness, if you
        // needed other complex User properties, you might still consider initializing.
        return sessions.stream()
                .map(this::convertToDto) // Convert each entity to DTO
                .collect(Collectors.toList());
    }

    public Map<String, Object> getDashboardDataForCurrentUser() {
        User currentUser = getCurrentUser();
        Map<String, Object> data = new HashMap<>();
        YearMonth thisMonth = YearMonth.now();
        LocalDate start = thisMonth.atDay(1);
        LocalDate end = thisMonth.atEndOfMonth();

        List<StudySession> sessions = repository.findByUserAndStudyDateBetween(currentUser, start, end);

        int totalMinutes = sessions.stream().mapToInt(StudySession::getDurationInMinutes).sum();
        int totalSessions = sessions.size();
        int goalMinutes = 12600; // 210 hours

        Map<String, Integer> weekdayMinutes = new HashMap<>();
        String[] weekDays = {"MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"};
        for (String day : weekDays) {
            weekdayMinutes.put(day, 0);
        }

        for (StudySession session : sessions) {
            String weekday = session.getStudyDate().getDayOfWeek()
                    .toString().substring(0, 3);
            weekdayMinutes.put(weekday,
                    weekdayMinutes.get(weekday) + session.getDurationInMinutes());
        }

        data.put("totalStudyMinutes", totalMinutes);
        data.put("totalSessions", totalSessions);
        data.put("goalMinutes", goalMinutes);
        data.put("weekdays", weekdayMinutes);
        // Convert the list of StudySession entities to StudySessionDto objects before putting into the map
        data.put("sessions", sessions.stream().map(this::convertToDto).collect(Collectors.toList()));

        return data;
    }
}