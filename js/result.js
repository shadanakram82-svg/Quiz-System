// Result Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const result = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_latest_result')));
    
    if (!result) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Clean up autosave since quiz is done
    localStorage.removeItem(App.getStorageKey('quiz_autosave'));

    // Populate Data
    document.getElementById('topic-title').innerText = `${result.topic} Result`;
    document.getElementById('stat-total').innerText = result.totalQuestions;
    document.getElementById('stat-correct').innerText = result.correctAnswers;
    document.getElementById('stat-wrong').innerText = result.wrongAnswers;
    
    // Format Time
    const minutes = Math.floor(result.timeTaken / 60);
    const seconds = result.timeTaken % 60;
    document.getElementById('stat-time').innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Pass / Fail logic
    const isPass = result.percentage >= 60;
    const gradeBadge = document.getElementById('grade-badge');
    const msg = document.getElementById('performance-msg');
    
    if (isPass) {
        gradeBadge.innerText = 'PASS';
        gradeBadge.className = 'grade-badge grade-pass';
        
        if (result.percentage >= 90) {
            msg.innerText = "Excellent work! You have mastered this topic.";
            msg.style.color = "var(--success-color)";
        } else if (result.percentage >= 75) {
            msg.innerText = "Good job! Keep it up.";
        } else {
            msg.innerText = "You passed, but there's room for improvement.";
        }
    } else {
        gradeBadge.innerText = 'FAIL';
        gradeBadge.className = 'grade-badge grade-fail';
        msg.innerText = "Don't give up! Review your answers and try again.";
        msg.style.color = "var(--danger-color)";
    }

    // Draw Canvas Chart
    let chartColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-color').trim();
    if (result.percentage < 60) chartColor = getComputedStyle(document.documentElement).getPropertyValue('--danger-color').trim();
    if (result.percentage >= 80) chartColor = getComputedStyle(document.documentElement).getPropertyValue('--success-color').trim();

    // Animate Chart
    let currentPercent = 0;
    const targetPercent = result.percentage;
    const animation = setInterval(() => {
        if (currentPercent >= targetPercent) {
            clearInterval(animation);
            CanvasChart.drawCircularChart('score-chart', targetPercent, chartColor);
        } else {
            currentPercent += 2;
            if (currentPercent > targetPercent) currentPercent = targetPercent;
            CanvasChart.drawCircularChart('score-chart', currentPercent, chartColor);
        }
    }, 20);

    // Restart Quiz Option
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            window.location.href = `quiz.html?topic=${encodeURIComponent(result.topic)}`;
        });
    }
});
