async function addStudySession(event) {
    event.preventDefault();

    const courseName = document.getElementById('courseName').value;
    const duration = document.getElementById('duration').value;
    const studyDate = document.getElementById('studyDate').value;
    const description = document.getElementById('description').value;

    if (!duration || !studyDate || !courseName) {
        alert('Please fill in all required fields: Duration, Study Date, and Course Name.');
        return;
    }

    try {
        const response = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                courseName: courseName,
                durationInMinutes: parseInt(duration),
                studyDate: studyDate,
                description: description
                // userId and username are handled by the backend
            })
        });

        if (response.ok) {
            // Backend returns StudySessionDto, but we don't need to parse it if we just reload
            // const savedSessionDto = await response.json();
            alert('Session added successfully!');
            document.getElementById('sessionForm').reset();
            loadRecentSessions(); // Reload recent sessions
            // If you're on the dashboard, you might want to call fetchDashboardData() here
            // window.location.reload(); // Simple way to refresh all data on the page
        } else if (response.status === 401 || response.status === 403) {
            console.error('Authentication required to add session. Redirecting to login.');
            alert('You need to be logged in to add a study session. Redirecting to login.');
            window.location.href = '/login.html';
        } else {
            const errorData = await response.json();
            console.error('Failed to add session:', response.status, response.statusText, errorData);
            alert('Error adding session: ' + (errorData.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error during session add:', error);
        alert('An unexpected error occurred: ' + error.message);
    }
}

// Function to load recent sessions
function loadRecentSessions() {
    fetch('/api/sessions')
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 401 || response.status === 403) {
                console.error('Authentication required to load sessions. Redirecting to login.');
                window.location.href = '/login.html';
                return Promise.reject('Authentication required');
            } else {
                return response.json().then(err => {
                    console.error('Error loading sessions:', response.status, response.statusText, err);
                    document.getElementById('recentSessions').innerHTML =
                        '<p class="text-red-500">Error loading sessions: ' + (err.message || 'Unknown error') + '</p>';
                    return Promise.reject(err);
                });
            }
        })
        .then(sessions => {
            const container = document.getElementById('recentSessions');
            if (!container) {
                console.error('Element with ID "recentSessions" not found.');
                return;
            }
            container.innerHTML = '';

            // Show only last 5 sessions
            const recentSessions = sessions.slice(0, 5);

            if (recentSessions.length === 0) {
                container.innerHTML = '<p class="text-gray-500">No sessions recorded yet</p>';
                return;
            }

            recentSessions.forEach(session => {
                const sessionEl = document.createElement('div');
                sessionEl.className = 'border-b border-gray-200 pb-4';
                sessionEl.innerHTML = `
                    <div class="flex justify-between">
                        <h3 class="font-medium">${session.courseName}</h3>
                        <span class="text-gray-600">${session.durationInMinutes} min</span>
                    </div>
                    <div class="text-sm text-gray-500">${new Date(session.studyDate).toLocaleDateString()}</div>
                    ${session.description ? `<div class="text-sm mt-1">${session.description}</div>` : ''}
                    <div class="text-xs text-gray-400">By: ${session.username || 'N/A'}</div> <!-- Display username from DTO -->
                `;
                container.appendChild(sessionEl);
            });
        })
        .catch(error => {
            console.error('Error during recent sessions fetch:', error);
            if (error !== 'Authentication required') {
                document.getElementById('recentSessions').innerHTML =
                    '<p class="text-red-500">An unexpected error occurred loading sessions.</p>';
            }
        });
}

// Initial setup for app.js (session form and recent sessions)
document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default for the form
    document.getElementById('studyDate').valueAsDate = new Date();

    // Attach event listener for the session form submission
    const sessionForm = document.getElementById('sessionForm');
    if (sessionForm) {
        sessionForm.addEventListener('submit', addStudySession);
    } else {
        console.warn('Session form with ID "sessionForm" not found. Add session functionality might not work.');
    }

    // Load recent sessions on page load
    loadRecentSessions();
});


// Common checkSession function for protected pages (e.g., index.html, dashboard.html)
// This can be loaded in <head> or at the top of other scripts
async function checkSession() {
    try {
        const response = await fetch('/check-session', {
            method: 'GET'
        });
        const isLoggedIn = await response.json();
        const path = window.location.pathname;

        if (isLoggedIn) {
            // If logged in, redirect away from login/register/home to index or dashboard
            if (path === '/login.html' || path === '/register.html' || path === '/home.html' || path === '/') {
                window.location.href = '/index.html'; // Or your main application page
            }
        } else {
            // If not logged in, redirect protected pages to home/login
            if (path === '/index.html' || path === '/dashboard.html') { // Add other protected pages here
                window.location.href = '/home.html'; // Or '/login.html'
            }
        }
    } catch (error) {
        console.error('Error checking session:', error);
        // If there's a network error during session check, assume not logged in and redirect if on protected page
        const path = window.location.pathname;
        if (path === '/index.html' || path === '/dashboard.html') {
             window.location.href = '/home.html';
        }
    }
}

// This needs to be called on pages that require authentication check on load.
// Example for index.html and dashboard.html:
// Add <script src="/app.js"></script> and then in a separate <script> tag or at the end of app.js:
// document.addEventListener('DOMContentLoaded', checkSession);

// Function to handle user logout (keeping it here for general utility, also in my previous app.js example)
async function logout() {
    try {
        const response = await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Logged out successfully');
            window.location.href = '/home.html'; // Redirect to home page after logout
        } else {
            console.error('Logout failed:', response.status, response.statusText);
            alert('Failed to log out. Please try again.');
        }
    } catch (error) {
        console.error('Error during logout:', error);
        alert('An unexpected error occurred during logout.');
    }
}

// Add event listener for logout button (if it exists on any page)
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}