// Quiz Logic
document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let reviewMarked = {};
    let timerInterval;
    let timeLeft = 600; // 10 minutes default

    const topicParams = new URLSearchParams(window.location.search);
    const selectedTopic = topicParams.get('topic') || 'Mixed (All Topics)';

    document.getElementById('topic-display').innerText = `Topic: ${selectedTopic}`;

    // Load Questions
    if (window.quizQuestions) {
        initializeQuiz(window.quizQuestions);
    } else {
        fetch('../data/questions.json')
            .then(res => res.json())
            .then(data => initializeQuiz(data))
            .catch(err => console.error("Error loading questions", err));
    }

    function initializeQuiz(data) {
        // Filter by topic if not Mixed
        if (selectedTopic !== 'Mixed (All Topics)') {
            questions = data.filter(q => q.topic === selectedTopic);
        } else {
            questions = [...data];
        }

        // Get difficulty priority from localStorage
        const difficultyPriority = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_difficulty_priority'))) || ["Easy", "Medium", "Hard", "Expert"];

        // Sort based on difficulty priority first, then randomize within same difficulty
        questions.sort((a, b) => {
            const indexA = difficultyPriority.indexOf(a.difficulty || "Easy");
            const indexB = difficultyPriority.indexOf(b.difficulty || "Easy");
            
            if (indexA !== indexB) {
                return indexA - indexB; // Lower index means higher priority
            }
            return Math.random() - 0.5; // Randomize within same priority
        });
        
        // Take up to 10 questions for a session
        questions = questions.slice(0, 10);

        if (questions.length === 0) {
            App.showToast("No questions available for this topic.", "error");
            setTimeout(() => window.location.href = 'dashboard.html', 2000);
            return;
        }

        // Check if there is an autosaved session
        const savedSession = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_autosave')));
        if (savedSession && savedSession.topic === selectedTopic) {
            userAnswers = savedSession.answers;
            reviewMarked = savedSession.reviewMarked;
            timeLeft = savedSession.timeLeft;
            currentQuestionIndex = savedSession.currentIndex;
            App.showToast("Restored previous session", "info");
        }

        renderQuestion();
        renderNavigator();
        startTimer();
    }

    function renderQuestion() {
        const q = questions[currentQuestionIndex];
        
        document.getElementById('question-counter').innerText = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
        document.getElementById('question-text').innerText = q.question;

        // Progress Bar
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;

        // Options
        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';
        
        const letters = ['A', 'B', 'C', 'D'];
        
        q.options.forEach((opt, index) => {
            const isSelected = userAnswers[q.id] === index;
            
            const optionHTML = `
                <label class="option-label ${isSelected ? 'selected' : ''}" data-index="${index}">
                    <input type="radio" name="option" value="${index}" ${isSelected ? 'checked' : ''}>
                    <div class="option-letter">${letters[index]}</div>
                    <div class="option-text">${opt}</div>
                </label>
            `;
            optionsGrid.innerHTML += optionHTML;
        });

        // Add event listeners to options
        document.querySelectorAll('.option-label').forEach(label => {
            label.addEventListener('click', function() {
                // Remove selected class from all
                document.querySelectorAll('.option-label').forEach(l => l.classList.remove('selected'));
                // Add to clicked
                this.classList.add('selected');
                
                const selectedIndex = parseInt(this.getAttribute('data-index'));
                userAnswers[q.id] = selectedIndex;
                
                updateNavigatorDot(currentQuestionIndex);
                autoSave();
            });
        });

        // Update Nav Buttons
        document.getElementById('btn-prev').disabled = currentQuestionIndex === 0;
        
        const btnNext = document.getElementById('btn-next');
        if (currentQuestionIndex === questions.length - 1) {
            btnNext.innerText = 'Finish';
            btnNext.classList.remove('btn-primary');
            btnNext.classList.add('btn-outline');
        } else {
            btnNext.innerText = 'Next';
            btnNext.classList.add('btn-primary');
            btnNext.classList.remove('btn-outline');
        }

        // Review Button state
        const btnReview = document.getElementById('btn-review');
        if (reviewMarked[q.id]) {
            btnReview.classList.add('btn-primary');
            btnReview.classList.remove('btn-outline');
            btnReview.innerHTML = '<i class="fas fa-flag"></i> Marked for Review';
        } else {
            btnReview.classList.add('btn-outline');
            btnReview.classList.remove('btn-primary');
            btnReview.innerHTML = '<i class="fas fa-flag"></i> Mark for Review';
        }
    }

    function renderNavigator() {
        const navGrid = document.getElementById('question-nav');
        navGrid.innerHTML = '';
        
        questions.forEach((q, index) => {
            const dot = document.createElement('div');
            dot.className = 'nav-dot';
            dot.innerText = index + 1;
            
            dot.addEventListener('click', () => {
                currentQuestionIndex = index;
                renderQuestion();
                updateNavigatorStyles();
                autoSave();
            });
            
            navGrid.appendChild(dot);
        });
        updateNavigatorStyles();
    }

    function updateNavigatorDot(index) {
        const dots = document.querySelectorAll('.nav-dot');
        const qId = questions[index].id;
        
        dots[index].className = 'nav-dot'; // Reset classes
        if (reviewMarked[qId]) {
            dots[index].classList.add('review');
        } else if (userAnswers[qId] !== undefined) {
            dots[index].classList.add('answered');
        }
        if (index === currentQuestionIndex) {
            dots[index].classList.add('current');
        }
    }

    function updateNavigatorStyles() {
        questions.forEach((q, i) => {
            updateNavigatorDot(i);
        });
    }

    // Auto Save feature
    function autoSave() {
        const sessionData = {
            topic: selectedTopic,
            answers: userAnswers,
            reviewMarked: reviewMarked,
            timeLeft: timeLeft,
            currentIndex: currentQuestionIndex,
            questionsData: questions // save questions to keep random order for review page
        };
        localStorage.setItem(App.getStorageKey('quiz_autosave'), JSON.stringify(sessionData));
    }

    // Timer
    function startTimer() {
        const timerDisplay = document.querySelector('#timer span');
        
        timerInterval = setInterval(() => {
            timeLeft--;
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft % 10 === 0) autoSave(); // Auto save every 10 seconds

            if (timeLeft <= 60) {
                document.getElementById('timer').style.animation = 'pulse 1s infinite';
            }

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                submitQuiz();
            }
        }, 1000);
    }

    // Navigation Buttons
    document.getElementById('btn-next').addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            renderQuestion();
            updateNavigatorStyles();
            autoSave();
        } else {
            showSubmitModal();
        }
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            renderQuestion();
            updateNavigatorStyles();
            autoSave();
        }
    });

    document.getElementById('btn-review').addEventListener('click', () => {
        const qId = questions[currentQuestionIndex].id;
        reviewMarked[qId] = !reviewMarked[qId];
        renderQuestion();
        updateNavigatorStyles();
        autoSave();
    });

    // Submit Logic
    document.getElementById('btn-submit').addEventListener('click', showSubmitModal);

    function showSubmitModal() {
        const unansweredCount = questions.length - Object.keys(userAnswers).length;
        document.getElementById('unanswered-count').innerText = unansweredCount;
        
        if(unansweredCount > 0) {
            document.getElementById('unanswered-count').style.color = 'var(--danger-color)';
        } else {
            document.getElementById('unanswered-count').style.color = 'var(--success-color)';
        }

        document.getElementById('submit-modal').classList.add('active');
    }

    document.getElementById('modal-cancel').addEventListener('click', () => {
        document.getElementById('submit-modal').classList.remove('active');
    });

    document.getElementById('modal-confirm').addEventListener('click', () => {
        submitQuiz();
    });

    function submitQuiz() {
        clearInterval(timerInterval);
        
        let correctCount = 0;
        
        // Ensure final session save
        autoSave();
        
        // Save data for review page before autosave is cleared in result page
        localStorage.setItem(App.getStorageKey('quiz_review_data'), JSON.stringify({
            questionsData: questions,
            userAnswers: userAnswers
        }));
        
        // Calculate result
        questions.forEach(q => {
            if (userAnswers[q.id] === q.answer) {
                correctCount++;
            }
        });

        const totalTimeTaken = 600 - timeLeft; // in seconds

        const resultData = {
            topic: selectedTopic,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            wrongAnswers: Object.keys(userAnswers).length - correctCount,
            unanswered: questions.length - Object.keys(userAnswers).length,
            percentage: Math.round((correctCount / questions.length) * 100),
            timeTaken: totalTimeTaken,
            date: new Date().toISOString()
        };

        // Save result
        localStorage.setItem(App.getStorageKey('quiz_latest_result'), JSON.stringify(resultData));
        
        // Append to history
        let history = JSON.parse(localStorage.getItem(App.getStorageKey('quiz_history'))) || [];
        history.push(resultData);
        localStorage.setItem(App.getStorageKey('quiz_history'), JSON.stringify(history));

        // Go to result page
        window.location.href = 'result.html';
    }
});
