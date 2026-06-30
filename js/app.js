// Global App state and utilities
const App = {
    // Current user state
    user: JSON.parse(localStorage.getItem('quiz_user')) || null,

    // Base paths
    getBasePath: () => {
        // Simple logic to find path depth based on location
        const path = window.location.pathname;
        if (path.includes('/pages/')) {
            return '../';
        }
        return './';
    },

    // Get user specific storage key
    getStorageKey: (key) => {
        if (App.user && App.user.email) {
            return `${key}_${App.user.email}`;
        }
        return key;
    },

    // Check if user is logged in
    checkAuth: () => {
        const path = window.location.pathname;
        const isLoginPage = path.endsWith('login.html');
        const isIndexPage = path.endsWith('index.html') || path === '/' || (path.endsWith('/') && !path.includes('/pages/'));

        if (!App.user) {
            if (!isLoginPage) {
                window.location.href = App.getBasePath() + 'pages/login.html';
            }
        } else {
            if (isLoginPage || isIndexPage) {
                window.location.href = App.getBasePath() + 'pages/dashboard.html';
            }
        }
    },

    // Logout
    logout: () => {
        localStorage.removeItem('quiz_user');
        window.location.href = App.getBasePath() + 'pages/login.html';
    },

    // Show Toast Notification
    showToast: (message, type = 'info') => {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'info-circle';
        if (type === 'success') icon = 'check-circle';
        if (type === 'error') icon = 'exclamation-circle';
        if (type === 'warning') icon = 'exclamation-triangle';

        toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
        
        container.appendChild(toast);

        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, 3000);
    },

    // Mobile Menu Toggle
    initMobileMenu: () => {
        const btn = document.querySelector('.mobile-menu-btn');
        const nav = document.querySelector('.nav-links');
        if (btn && nav) {
            btn.addEventListener('click', () => {
                nav.classList.toggle('active');
            });
        }
    },

    // Setup Navigation Logout
    initNav: () => {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                App.logout();
            });
        }
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    App.checkAuth();
    App.initMobileMenu();
    App.initNav();
});
