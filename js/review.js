// Review Page Logic
document.addEventListener('DOMContentLoaded', () => {
    // Note: To review answers properly, we need the exact session data that was just completed.
    // Since we cleared autosave, we should have saved a 'quiz_last_session' or we just pass the info.
    // For this implementation, I will assume we saved the session data as `quiz_last_session` in quiz.js right before clearing autosave,
    // OR we can just use the `quiz_autosave` before it's deleted. 
    // Let me update the approach: quiz.js should save `quiz_review_data` when submitted.
    
    // For now, if data doesn't exist, redirect.
    const reviewData = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_review_data')));
    
    if (!reviewData) {
        App.showToast("Review data not found. Please take a quiz first.", "error");
        setTimeout(() => window.location.href = 'dashboard.html', 1500);
        return;
    }

    const { questionsData, userAnswers } = reviewData;
    const reviewList = document.getElementById('review-list');
    reviewList.innerHTML = '';

    const letters = ['A', 'B', 'C', 'D'];

    questionsData.forEach((q, index) => {
        const userAnswer = userAnswers[q.id];
        const isCorrect = userAnswer === q.answer;
        const isUnanswered = userAnswer === undefined;
        
        let statusClass = 'status-wrong';
        let statusText = 'Wrong';
        let statusIcon = 'fa-times-circle';
        
        if (isCorrect) {
            statusClass = 'status-correct';
            statusText = 'Correct';
            statusIcon = 'fa-check-circle';
        } else if (isUnanswered) {
            statusClass = 'status-unanswered';
            statusText = 'Unanswered';
            statusIcon = 'fa-minus-circle';
        }

        let optionsHTML = '';
        q.options.forEach((opt, optIndex) => {
            let optClass = '';
            let optIcon = '';

            if (optIndex === q.answer) {
                optClass = 'correct-ans';
                optIcon = '<i class="fas fa-check ans-icon"></i>';
            } else if (optIndex === userAnswer && !isCorrect) {
                optClass = 'wrong-ans';
                optIcon = '<i class="fas fa-times ans-icon"></i>';
            }

            optionsHTML += `
                <div class="option-review ${optClass}">
                    <div class="option-letter">${letters[optIndex]}</div>
                    <div class="option-text">${opt} ${optIndex === userAnswer ? ' <strong>(Your Answer)</strong>' : ''}</div>
                    ${optIcon}
                </div>
            `;
        });

        const cardHTML = `
            <div class="glass-panel review-card">
                <div class="review-header">
                    <h3>Question ${index + 1}</h3>
                    <span class="status-badge ${statusClass}"><i class="fas ${statusIcon}"></i> ${statusText}</span>
                </div>
                <div class="question-text mb-3 text-lg font-medium">
                    ${q.question}
                </div>
                <div class="options-container">
                    ${optionsHTML}
                </div>
                <div class="explanation">
                    <h4><i class="fas fa-lightbulb"></i> Explanation</h4>
                    <p>${q.explanation || 'No explanation provided.'}</p>
                </div>
            </div>
        `;
        
        reviewList.innerHTML += cardHTML;
    });

    // Restart Quiz Option
    const btnRestart = document.getElementById('btn-restart');
    if (btnRestart) {
        // We might not have the original topic stored in reviewData in previous implementation,
        // Let's grab it from quiz_latest_result if it exists
        const latestResult = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_latest_result')));
        const topic = latestResult ? latestResult.topic : 'Mixed (All Topics)';
        
        btnRestart.addEventListener('click', () => {
            window.location.href = `quiz.html?topic=${encodeURIComponent(topic)}`;
        });
    }
});
