// History Logic
document.addEventListener('DOMContentLoaded', () => {
    
    const history = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_history'))) || [];
    const tbody = document.getElementById('history-body');
    const container = document.getElementById('history-container');
    const btnExport = document.getElementById('btn-export');
    const btnClear = document.getElementById('btn-clear');

    renderHistory();

    function renderHistory() {
        if (history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <h3>No History Found</h3>
                    <p>You haven't taken any quizzes yet.</p>
                    <a href="dashboard.html" class="btn btn-primary mt-3">Start a Quiz</a>
                </div>
            `;
            btnExport.style.display = 'none';
            btnClear.style.display = 'none';
            return;
        }

        btnExport.style.display = 'inline-flex';
        btnClear.style.display = 'inline-flex';
        
        tbody.innerHTML = '';
        
        // Sort descending
        const sortedHistory = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));

        sortedHistory.forEach(item => {
            const d = new Date(item.date);
            const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const isPass = item.percentage >= 60;
            const statusClass = isPass ? 'badge-pass' : 'badge-fail';
            const statusText = isPass ? 'Pass' : 'Fail';

            const minutes = Math.floor(item.timeTaken / 60);
            const seconds = item.timeTaken % 60;
            const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${dateStr}</td>
                <td>${item.topic}</td>
                <td>${item.correctAnswers} / ${item.totalQuestions}</td>
                <td>${item.percentage}%</td>
                <td><span class="badge ${statusClass}">${statusText}</span></td>
                <td>${timeStr}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Export CSV
    if (btnExport) {
        btnExport.addEventListener('click', () => {
            if (history.length === 0) return;

            const headers = ['Date', 'Time', 'Topic', 'Total Questions', 'Correct Answers', 'Wrong Answers', 'Percentage', 'Time Taken (s)'];
            const data = history.map(item => {
                const d = new Date(item.date);
                return [
                    d.toLocaleDateString(),
                    d.toLocaleTimeString(),
                    item.topic,
                    item.totalQuestions,
                    item.correctAnswers,
                    item.wrongAnswers,
                    `${item.percentage}%`,
                    item.timeTaken
                ];
            });

            CSV.exportToCSV(headers, data, `Quiz_History_${new Date().getTime()}.csv`);
            App.showToast("Export successful!", "success");
        });
    }

    // Clear History
    if (btnClear) {
        btnClear.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete all history? This cannot be undone.")) {
                localStorage.removeItem(App.getStorageKey('quiz_history'));
                history.length = 0; // clear array
                renderHistory();
                App.showToast("History cleared.", "info");
            }
        });
    }
});
