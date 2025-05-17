document.addEventListener('DOMContentLoaded', function() {
    // Set today's date as default
    document.getElementById('studyDate').valueAsDate = new Date();

    // Form submission
    document.getElementById('sessionForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const session = {
            courseName: document.getElementById('courseName').value,
            durationInMinutes: parseInt(document.getElementById('duration').value),
            studyDate: document.getElementById('studyDate').value,
            description: document.getElementById('description').value
        };

        fetch('/api/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(session)
        })
        .then(response => response.json())
        .then(data => {
            alert('Session added successfully!');
            document.getElementById('sessionForm').reset();
            loadRecentSessions();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error adding session');
        });
    });

    // Load recent sessions
    loadRecentSessions();
});

function loadRecentSessions() {
    fetch('/api/sessions')
        .then(response => response.json())
        .then(sessions => {
            const container = document.getElementById('recentSessions');
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
                `;
                container.appendChild(sessionEl);
            });
        })
        .catch(error => {
            console.error('Error loading sessions:', error);
            document.getElementById('recentSessions').innerHTML =
                '<p class="text-red-500">Error loading sessions</p>';
        });
}