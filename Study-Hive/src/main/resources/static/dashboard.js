async function checkSessionAndRedirect() {
    try {
        const response = await fetch('/check-session', {
            method: 'GET'
        });
        const isLoggedIn = await response.json();

        if (!isLoggedIn) {
            // If not logged in, redirect to home or login page
            console.warn('Session expired or user not logged in. Redirecting to home.');
            window.location.href = '/home.html'; // Or '/login.html'
        }
    } catch (error) {
        console.error('Error checking session:', error);
        // Fallback: assume not logged in if there's an error and redirect
        window.location.href = '/home.html'; // Or '/login.html'
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // First, check if the user is logged in for this protected page
    await checkSessionAndRedirect();

    // Set current month in the calendar card
    const now = new Date();
    document.getElementById('currentMonth').textContent =
        now.toLocaleString('default', { month: 'long', year: 'numeric' });

    // Load dashboard data
    fetch('/api/dashboard')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401 || response.status === 403) {
                // Unauthorized or Forbidden - redirect to login
                console.error('Authentication required or session invalid. Redirecting to login.');
                window.location.href = '/login.html'; // Redirect to login
                return Promise.reject('Authentication required'); // Stop further processing
            } else {
                return response.json().then(err => {
                    console.error('Failed to fetch dashboard data:', response.status, response.statusText, err);
                    alert('Error loading dashboard data: ' + (err.message || 'Unknown error'));
                    return Promise.reject(err);
                });
            }
        })
        .then(data => {
            updateGoalsCard(data);
            updateStreaksCard(data);
            updateCalendarCard(data);
            createRadarChart(data);
            populateSessionsTable(data.sessions); // Pass sessions from the DTO-driven dashboard data
        })
        .catch(error => {
            console.error('Error during dashboard data fetch:', error);
            // Alert only if it's not an authentication redirection error
            if (error !== 'Authentication required') {
                alert('An unexpected error occurred while loading dashboard: ' + error.message);
            }
        });
});

function updateGoalsCard(data) {
    const totalMinutes = data.totalStudyMinutes;
    // Note: your backend returns 'goalMinutes', not 'monthlyGoalMinutes'. Using 'goalMinutes'.
    const goalMinutes = data.goalMinutes;

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

        // Use the 'weekdays' data directly from the backend
        const minutesStudied = data.weekdays[day] || 0;

        if (day === todayDay) {
            className += "border-blue-500 text-blue-600"; // Highlight current day
        } else if (minutesStudied > 0) {
            className += "border-green-500 text-green-600"; // Past study day
        } else {
            className += "border-red-400 text-red-400"; // No study
        }

        el.className = className;
        streaksContainer.appendChild(el);
    });
}

function calculateStreak(sessions) {
  // This function is defined but not currently used in the provided frontend code.
  // It's typically used to calculate a consecutive streak based on study dates.
  // Sorting is correct.
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
    const goalMins = data.goalMinutes; // Using 'goalMinutes' from backend
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

    // Ensure the Chart.js library is loaded in your HTML before this script runs.
    if (typeof Chart === 'undefined') {
        console.error('Chart.js library not found. Please ensure it is loaded.');
        return;
    }

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: weekDaysOrder,
            datasets: [{
                label: 'Study Hours', // Added the missing 'label' key
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
                    display: false
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
    // Assuming 'sessionsTable' is the ID of the <tbody> element
    const tableBody = document.getElementById('sessionsTable');
    if (!tableBody) {
        console.error('Element with ID "sessionsTable" not found.');
        return;
    }
    tableBody.innerHTML = '';

    if (sessions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No sessions recorded yet</td>
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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${session.username || 'N/A'} <!-- Access username directly from DTO -->
            </td>
        `;
        tableBody.appendChild(row);
    });
}