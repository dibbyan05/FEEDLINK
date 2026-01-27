/**
 * FeedLink Login Form Handler
 * Manages user authentication and login process
 */

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const userTypeSelect = document.getElementById('userType');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('passwordInput');
    const submitBtn = document.querySelector('.login-submit');
    
    // Add ID to email input if missing
    const emailInput = document.querySelector('input[type="email"]');

    // Password visibility toggle
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Validate form
            const userType = userTypeSelect.value;
            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!userType) {
                APIUtils.showErrorMessage('Please select your role');
                return;
            }

            if (!email) {
                APIUtils.showErrorMessage('Please enter your email');
                return;
            }

            if (!password) {
                APIUtils.showErrorMessage('Please enter your password');
                return;
            }

            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;

            try {
                // Send login request
                const result = await APIUtils.login(email, password, userType);

                if (result.success) {
                    const token = result.data?.token;
                    if (token) {
                        // Store token in localStorage
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('userType', userType);
                        localStorage.setItem('userEmail', email);
                        
                        APIUtils.showSuccessMessage('Login successful! Redirecting...');
                        
                        // Redirect to dashboard after 1 second
                        setTimeout(() => {
                            const dashboard = userType === 'donor' 
                                ? 'donor-dashboard.html' 
                                : 'ngo-dashboard.html';
                            window.location.href = dashboard;
                        }, 1000);
                    }
                } else {
                    APIUtils.showErrorMessage(result.error || 'Login failed. Please check your credentials.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }

            } catch (error) {
                console.error('Login error:', error);
                
                // Restore button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                APIUtils.showErrorMessage('An error occurred during login. Please try again.');
            }
        });
    }

    // Forgot password link
    const forgotPassLink = document.querySelector('.forgot-pass');
    if (forgotPassLink) {
        forgotPassLink.addEventListener('click', function(e) {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (!email) {
                APIUtils.showErrorMessage('Please enter your email first');
                return;
            }
            
            // TODO: Implement password reset flow
            alert('Password reset functionality coming soon. Please contact support.');
        });
    }
});
