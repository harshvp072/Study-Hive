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
    const totalMinutes = data.totalStudyMinutes;
    const goalMinutes = data.monthlyGoalMinutes;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const goalHours = Math.floor(goalMinutes / 60);

    const progress = (totalMinutes / goalMinutes) * 100;

    const studyTimeEl = document.getElementById("studyTime");
    if (studyTimeEl) {
        studyTimeEl.textContent = `${hours}h ${minutes}m`;
    }

    const goalTimeEl = document.getElementById("goalTime");
    if (goalTimeEl) {
        goalTimeEl.textContent = `${goalHours}h`;
    }

    const sessionsCountEl = document.getElementById("sessionsCount");
    if (sessionsCountEl) {
        sessionsCountEl.textContent = data.totalSessions;
    }

    const progressBarEl = document.getElementById("progressBar");
    if (progressBarEl) {
        progressBarEl.style.width = `${progress}%`;
    }

    const progressPercentEl = document.getElementById("progressPercent");
    if (progressPercentEl) {
        progressPercentEl.textContent = `${progress.toFixed(1)}%`;
    }

    const goalStatusEl = document.getElementById("goalStatus");
    if (goalStatusEl) {
        goalStatusEl.textContent =
            progress >= 100
                ? "Goal Achieved 🎉"
                : "Keep Going 💪";
    }
}

function updateStreaksCard(data) {
    const weekDaysOrder = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const streaksContainer = document.getElementById("streaksDays");
    streaksContainer.innerHTML = '';

    const today = new Date();
    const todayDay = weekDaysOrder[today.getDay()]; // Get today's name (e.g., "MON")

    weekDaysOrder.forEach(day => {
        const el = document.createElement("div");
        el.textContent = day;

        // Determine class based on data
        let className = "rounded-full p-2 border-2 text-sm font-bold ";

        if (day === todayDay) {
            className += "border-blue-500 text-blue-600"; // Highlight current day
        } else if (data.weekdays[day] > 0) {
            className += "border-green-500 text-green-600"; // Past study day
        } else {
            className += "border-red-400 text-red-400"; // No study
        }

        el.className = className;
        streaksContainer.appendChild(el);
    });
}

function calculateStreak(sessions) {
  // Sort by date
  sessions.sort((a, b) => new Date(b.studyDate) - new Date(a.studyDate));
  let streak = 0;
  let currentDate = new Date();

  for (let session of sessions) {
    const sessionDate = new Date(session.studyDate);

    if (
      sessionDate.toDateString() === currentDate.toDateString()
    ) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (
      sessionDate.toDateString() ===
      new Date(currentDate.setDate(currentDate.getDate() - 1)).toDateString()
    ) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
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

    const weekDaysOrder = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const chartData = weekDaysOrder.map(day => (data.weekdays[day] / 60).toFixed(1));

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: weekDaysOrder,
            datasets: [{
                // ❌ No 'label' key
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
            plugins: {
                legend: {
                    display: false  // ✅ Hide the legend
                }
            },
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