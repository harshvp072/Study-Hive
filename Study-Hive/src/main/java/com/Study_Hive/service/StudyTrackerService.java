package com.Study_Hive.service;

import com.Study_Hive.model.StudySession;
import com.Study_Hive.repo.StudySessionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class StudyTrackerService {
    private final StudySessionRepository repository;

    public StudyTrackerService(StudySessionRepository repository) {
        this.repository = repository;
    }

    public StudySession saveSession(StudySession session) {
        System.out.println("Saving session: " + session); // For debug
        return repository.save(session);
    }

    public List<StudySession> getAllSessions() {
        return repository.findAll();
    }

    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        YearMonth thisMonth = YearMonth.now();
        LocalDate start = thisMonth.atDay(1);
        LocalDate end = thisMonth.atEndOfMonth();

        List<StudySession> sessions = repository.findByStudyDateBetween(start, end);

        int totalMinutes = sessions.stream().mapToInt(StudySession::getDurationInMinutes).sum();
        int totalSessions = sessions.size();
        int goalMinutes = 12600; // 210 hours

        // Group by day of week
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
        data.put("sessions", sessions);

        return data;
    }
}