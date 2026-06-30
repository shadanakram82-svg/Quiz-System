// Form Validation Utilities
const Validation = {
    // Email regex
    isEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    },

    // Password strength (min 6 chars for this demo)
    isStrongPassword: (password) => {
        return password.length >= 6;
    },

    // Show error message under input
    showError: (inputElement, message) => {
        // Remove existing error if any
        Validation.clearError(inputElement);

        const formGroup = inputElement.closest('.form-group');
        inputElement.style.borderColor = 'var(--danger-color)';

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message text-sm mt-1';
        errorDiv.style.color = 'var(--danger-color)';
        errorDiv.innerText = message;

        formGroup.appendChild(errorDiv);
    },

    // Clear error message
    clearError: (inputElement) => {
        const formGroup = inputElement.closest('.form-group');
        inputElement.style.borderColor = '';
        const existingError = formGroup.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
    },

    // Clear all errors in a form
    clearAllErrors: (formElement) => {
        const inputs = formElement.querySelectorAll('.form-control');
        inputs.forEach(input => Validation.clearError(input));
    }
};
