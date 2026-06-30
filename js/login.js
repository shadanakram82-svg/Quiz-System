// Login Page Logic
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const rememberCheckbox = document.getElementById('remember');
    const forgotBtn = document.getElementById('forgot-btn');

    // Pre-fill email if remembered
    const rememberedEmail = localStorage.getItem('quiz_remembered_email');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
    }

    // Toggle Password Visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordBtn.classList.toggle('fa-eye');
            togglePasswordBtn.classList.toggle('fa-eye-slash');
        });
    }

    // Handle Forgot Password
    if (forgotBtn) {
        forgotBtn.addEventListener('click', (e) => {
            e.preventDefault();
            App.showToast('Password reset link sent to your email!', 'info');
        });
    }

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Clear previous errors
            Validation.clearAllErrors(loginForm);
            
            let isValid = true;
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            // Validate Email
            if (!email) {
                Validation.showError(emailInput, 'Email is required');
                isValid = false;
            } else if (!Validation.isEmail(email)) {
                Validation.showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            }

            // Validate Password
            if (!password) {
                Validation.showError(passwordInput, 'Password is required');
                isValid = false;
            } else if (!Validation.isStrongPassword(password)) {
                Validation.showError(passwordInput, 'Password must be at least 6 characters');
                isValid = false;
            }

            if (isValid) {
                // Simulate Login Success
                const btn = loginForm.querySelector('.login-btn');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                btn.disabled = true;

                setTimeout(() => {
                    // Save user session
                    const user = { email: email, name: email.split('@')[0], loggedInAt: new Date().toISOString() };
                    localStorage.setItem('quiz_user', JSON.stringify(user));

                    // Remember Me
                    if (rememberCheckbox.checked) {
                        localStorage.setItem('quiz_remembered_email', email);
                    } else {
                        localStorage.removeItem('quiz_remembered_email');
                    }

                    // Redirect to dashboard
                    window.location.href = '../pages/dashboard.html';
                }, 1000);
            }
        });
    }
});
