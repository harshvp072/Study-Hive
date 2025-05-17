document.addEventListener('DOMContentLoaded', function() {
    // Set current month in the calendar card
    const now = new Date();
    document.getElementById('currentMonth').textContent =
        now.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Load dashboard data
    fetch('/api/dashboard')
        .then(response => response.json())
        .then(data => {
            updateGoalsCard(data);
            updateStreaksCard(data);
            updateCalendarCard(data);
            createRadarChart(data);
            populateSessionsTable(data.sessions);
        })
        .catch(error => {
            console.error('Error loading dashboard data:', error);
            alert('Error loading dashboard data');
        });
});

function updateGoalsCard(data) {
    const hours = Math.floor(data.totalStudyMinutes / 60);
    const minutes = data.totalStudyMinutes % 60;
    document.getElementById("studyTime").textContent = `${hours}h ${minutes}m`;

    const goalHours = Math.floor(data.goalMinutes / 60);
    document.getElementById("goalTime").textContent = `${goalHours}h`;

    document.getElementById("sessionsCount").textContent = data.totalSessions;

    const progress = Math.min((data.totalStudyMinutes / data.goalMinutes) * 100, 100);
    document.getElementById("progressBar").style.width = `${progress}%`;
    document.getElementById("progressPercent").textContent = `${progress.toFixed(1)}%`;

    const goalStatus = document.getElementById("goalStatus");
    goalStatus.textContent = progress >= 100 ? "🎉 Study goal achieved!" : "Study goal not achieved";
    goalStatus.className = progress >= 100
        ? "mt-4 text-green-500 font-semibold"
        : "mt-4 text-red-500 font-semibold";
}

function updateStreaksCard(data) {
    const weekDaysOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const streaksContainer = document.getElementById("streaksDays");
    streaksContainer.innerHTML = '';

    weekDaysOrder.forEach(day => {
        const el = document.createElement("div");
        el.textContent = day;
        el.className = "rounded-full p-2 border-2 text-sm font-bold " +
                      (data.weekdays[day] > 0 ? "border-green-500 text-green-600" : "border-red-400 text-red-400");
        streaksContainer.appendChild(el);
    });
}

function updateCalendarCard(data) {
    const totalMins = data.totalStudyMinutes;
    const goalMins = data.goalMinutes;
    const calHours = Math.floor(totalMins / 60);
    const calMinutes = totalMins % 60;

    document.getElementById("calendarTime").textContent = `${calHours}h ${calMinutes}m`;
    document.getElementById("calendarGoal").textContent = `${Math.floor(goalMins / 60)}h`;
    document.getElementById("calendarSessions").textContent = data.totalSessions;

    const calendarProgress = Math.min((totalMins / goalMins) * 100, 100);
    document.getElementById("calendarProgressBar").style.width = `${calendarProgress}%`;
}

function createRadarChart(data) {
    const ctx = document.getElementById('radarChart');

    // Ensure consistent weekday order
    const weekDaysOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const chartData = weekDaysOrder.map(day => (data.weekdays[day] / 60).toFixed(1));

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: weekDaysOrder,
            datasets: [{
                label: 'Study Duration (hours)',
                data: chartData,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 2,
                pointBackgroundColor: 'rgba(99, 102, 241, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function populateSessionsTable(sessions) {
    const tableBody = document.getElementById('sessionsTable');
    tableBody.innerHTML = '';

    if (sessions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="px-6 py-4 text-center text-gray-500">No sessions recorded yet</td>
            </tr>
        `;
        return;
    }

    sessions.forEach(session => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${new Date(session.studyDate).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${session.courseName}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${session.durationInMinutes} minutes
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
                ${session.description || '-'}
            </td>
        `;
        tableBody.appendChild(row);
    });
}