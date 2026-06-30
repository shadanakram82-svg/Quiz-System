// Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    // Set Welcome Message
    if (App.user && App.user.name) {
        document.getElementById('welcome-message').innerText = `Welcome back, ${App.user.name}!`;
    }

    // Load History to calculate stats
    const history = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_history'))) || [];
    
    const totalQuizzes = history.length;
    const completedQuizzes = history.length; // Assuming all in history are completed
    let avgScore = 0;
    let bestScore = 0;

    if (totalQuizzes > 0) {
        const totalPercentage = history.reduce((sum, attempt) => sum + attempt.percentage, 0);
        avgScore = Math.round(totalPercentage / totalQuizzes);
        bestScore = Math.max(...history.map(a => a.percentage));
    }

    // Update DOM
    document.getElementById('stat-total-quizzes').innerText = totalQuizzes;
    document.getElementById('stat-completed').innerText = completedQuizzes;
    document.getElementById('stat-avg-score').innerText = `${avgScore}%`;
    document.getElementById('stat-best-score').innerText = `${bestScore}%`;

    // Render Recent Activity
    const activityList = document.getElementById('activity-list');
    if (history.length > 0) {
        activityList.innerHTML = '';
        // Get top 5 recent
        const recentHistory = history.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        
        recentHistory.forEach(item => {
            const dateStr = new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            let iconClass = item.percentage >= 60 ? 'fa-check' : 'fa-times';
            let iconColor = item.percentage >= 60 ? 'var(--success-color)' : 'var(--danger-color)';
            let iconBg = item.percentage >= 60 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';

            const activityHTML = `
                <div class="activity-item">
                    <div class="activity-icon" style="color: ${iconColor}; background: ${iconBg}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="activity-details">
                        <p>Completed <strong>Mixed Topics</strong> Quiz</p>
                        <p class="text-sm">Score: <span style="color: ${iconColor}">${item.percentage}%</span></p>
                        <span class="activity-time">${dateStr}</span>
                    </div>
                </div>
            `;
            activityList.innerHTML += activityHTML;
        });
    }

    // Render Quizzes (For demo, we'll extract topics from questions)
    let questionsData = [];
    if (window.quizQuestions) {
        questionsData = window.quizQuestions;
        renderQuizTopics(questionsData);
    } else {
        // Fallback fetch
        fetch('../data/questions.json')
            .then(res => res.json())
            .then(data => {
                questionsData = data;
                renderQuizTopics(data);
            })
            .catch(err => console.error("Error loading questions", err));
    }

    function renderQuizTopics(data) {
        const quizList = document.getElementById('quiz-list');
        // Extract unique topics
        const topics = [...new Set(data.map(q => q.topic))];
        
        // Add "Mixed" category
        topics.unshift('Mixed (All Topics)');

        const renderTopics = (topicsToRender) => {
            quizList.innerHTML = '';
            if (topicsToRender.length === 0) {
                quizList.innerHTML = '<div class="text-center text-muted p-4">No topics found.</div>';
                return;
            }

            topicsToRender.forEach((topic, index) => {
                const count = topic === 'Mixed (All Topics)' ? data.length : data.filter(q => q.topic === topic).length;
                const delay = index * 0.1;
                
                const itemHTML = `
                    <div class="glass-panel quiz-item" style="animation: fadeIn 0.5s ease-out ${delay}s both;">
                        <div class="quiz-info">
                            <h4>${topic}</h4>
                            <p class="text-sm text-muted">${count} Questions</p>
                        </div>
                        <a href="quiz.html?topic=${encodeURIComponent(topic)}" class="btn btn-outline text-sm">
                            Start <i class="fas fa-play" style="font-size: 0.8em;"></i>
                        </a>
                    </div>
                `;
                quizList.innerHTML += itemHTML;
            });
        };

        renderTopics(topics);

        // Setup Search
        const searchInput = document.getElementById('quiz-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase();
                const filteredTopics = topics.filter(t => t.toLowerCase().includes(query));
                renderTopics(filteredTopics);
            });
        }
    }
});
