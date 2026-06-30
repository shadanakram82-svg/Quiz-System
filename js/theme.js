// Theme Management
const Theme = {
    init: () => {
        const savedTheme = localStorage.getItem(App.getStorageKey('quiz_theme')) || 'light';
        const savedAccent = localStorage.getItem(App.getStorageKey('quiz_accent')) || 'blue';
        
        Theme.applyTheme(savedTheme);
        Theme.applyAccent(savedAccent);
    },

    applyTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(App.getStorageKey('quiz_theme'), theme);
    },

    applyAccent: (accent) => {
        document.documentElement.setAttribute('data-accent', accent);
        localStorage.setItem(App.getStorageKey('quiz_accent'), accent);
    },

    toggleTheme: () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        Theme.applyTheme(newTheme);
        return newTheme;
    }
};

// Apply theme immediately to prevent flashing
Theme.init();
