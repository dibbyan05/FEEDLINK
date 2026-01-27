document.addEventListener('DOMContentLoaded', function() {
    // Password Visibility Toggle
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const cityInput = document.getElementById('city');
    const phoneInput = document.getElementById('phone');
    const userTypeSelect = document.getElementById('userType');
    const donorTypeField = document.getElementById('donorTypeField');
    const donorTypeSelect = document.getElementById('donorType');
    const signupForm = document.getElementById('signupForm');
    const submitBtn = document.querySelector('.signup-submit');

    function setupPasswordToggle(input, button) {
        if (!input || !button) return;
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            
            // Toggle icon
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    setupPasswordToggle(passwordInput, passwordToggle);
    setupPasswordToggle(confirmPasswordInput, confirmPasswordToggle);

    // Block password input above 8 characters
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            if (this.value.length > 8) {
                this.value = this.value.substring(0, 8);
            }
        });
    }

    // Real-time password match validation
    function validatePasswordMatch() {
        // Remove any existing error/success messages first
        const existingError = confirmPasswordInput.parentElement.querySelector('.error-message');
        const existingSuccess = confirmPasswordInput.parentElement.querySelector('.success-message');
        if (existingError) existingError.remove();
        if (existingSuccess) existingSuccess.remove();

        if (passwordInput.value && confirmPasswordInput.value) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.style.borderColor = '#f44336'; // Red border
                confirmPasswordInput.style.boxShadow = '0 0 5px rgba(244, 67, 54, 0.3)';
                
                // Show only one error message
                const errorMsg = document.createElement('small');
                errorMsg.className = 'error-message';
                errorMsg.style.cssText = 'color: #f44336; display: block; margin-top: 5px; font-size: 0.9rem;';
                errorMsg.textContent = '✗ Passwords do not match';
                confirmPasswordInput.parentElement.appendChild(errorMsg);
            } else {
                confirmPasswordInput.style.borderColor = '#4caf50'; // Green border
                confirmPasswordInput.style.boxShadow = '0 0 5px rgba(76, 175, 80, 0.3)';
                
                // Show only one success message
                const successMsg = document.createElement('small');
                successMsg.className = 'success-message';
                successMsg.style.cssText = 'color: #4caf50; display: block; margin-top: 5px; font-size: 0.9rem;';
                successMsg.textContent = '✓ Passwords match';
                confirmPasswordInput.parentElement.appendChild(successMsg);
            }
        } else {
            confirmPasswordInput.style.borderColor = '';
            confirmPasswordInput.style.boxShadow = '';
        }
    }

    // Listen to password input changes
    if (passwordInput) {
        passwordInput.addEventListener('input', validatePasswordMatch);
    }

    // Listen to confirm password input changes
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    if (userTypeSelect && donorTypeField && donorTypeSelect) {
        const toggleDonorField = function() {
            if (userTypeSelect.value === 'donor') {
                donorTypeField.classList.add('show');
                donorTypeField.style.display = 'block';
                donorTypeSelect.required = true;
            } else {
                donorTypeField.classList.remove('show');
                donorTypeField.style.display = 'none';
                donorTypeSelect.required = false;
                donorTypeSelect.value = '';
            }
        };

        userTypeSelect.addEventListener('change', toggleDonorField);
        toggleDonorField(); // Initialize on page load
    }

    // Handle form submission
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Collect form data
            const userData = {
                userType: userTypeSelect.value,
                donorType: donorTypeSelect.value || null,
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                password: passwordInput.value,
                confirmPassword: confirmPasswordInput.value,
                city: cityInput.value.trim(),
                phone: phoneInput.value.trim() || null,
            };

            // Validate all fields
            if (!userData.userType) {
                APIUtils.showErrorMessage('Please select your role');
                return;
            }

            if (userData.userType === 'donor' && !userData.donorType) {
                APIUtils.showErrorMessage('Please select your donor type');
                return;
            }

            if (!userData.fullName) {
                APIUtils.showErrorMessage('Please enter your full name');
                return;
            }

            if (!userData.email || !validateEmail(userData.email)) {
                APIUtils.showErrorMessage('Please enter a valid email address');
                return;
            }

            if (!userData.password) {
                APIUtils.showErrorMessage('Please enter a password');
                return;
            }

            if (userData.password.length < 8) {
                APIUtils.showErrorMessage('Password must be at least 8 characters long');
                return;
            }

            if (userData.password !== userData.confirmPassword) {
                APIUtils.showErrorMessage('Passwords do not match!');
                confirmPasswordInput.focus();
                return;
            }

            if (!userData.city) {
                APIUtils.showErrorMessage('Please enter your city');
                return;
            }

            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            try {
                // Remove confirmPassword before sending to backend
                const sendData = { ...userData };
                delete sendData.confirmPassword;

                const result = await APIUtils.signup(sendData);

                if (result.success) {
                    const token = result.data?.token;
                    if (token) {
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('userType', userData.userType);
                        localStorage.setItem('userEmail', userData.email);
                        
                        APIUtils.showSuccessMessage('Account created successfully! Redirecting...');
                        
                        // Redirect to login or dashboard after 2 seconds
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    }
                } else {
                    APIUtils.showErrorMessage(result.error || 'Failed to create account. Please try again.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error('Signup error:', error);
                APIUtils.showErrorMessage('An error occurred during signup. Please try again.');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
});

/**
 * Validate email format
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const userType = userTypeSelect.value;
            const donorType = donorTypeSelect.value;
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const city = document.getElementById('city').value.trim();
            const phone = document.getElementById('phone').value.trim();

            // Validate form
            if (!userType) {
                APIUtils.showErrorMessage('Please select your role');
                return;
            }

            if (userType === 'donor' && !donorType) {
                APIUtils.showErrorMessage('Please select your donor type');
                return;
            }

            if (!fullName) {
                APIUtils.showErrorMessage('Please enter your name');
                return;
            }

            if (!email || !email.includes('@')) {
                APIUtils.showErrorMessage('Please enter a valid email');
                return;
            }

            if (password.length < 8) {
                APIUtils.showErrorMessage('Password must be at least 8 characters long');
                return;
            }

            if (password !== confirmPassword) {
                APIUtils.showErrorMessage('Passwords do not match!');
                confirmPasswordInput.focus();
                return;
            }

            if (!city) {
                APIUtils.showErrorMessage('Please enter your city');
                return;
            }

            // Show loading state
            const submitBtn = document.querySelector('.signup-submit');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
            submitBtn.disabled = true;

            try {
                // Check if email already exists
                const emailCheckResponse = await APIUtils.get(
                    `${API_CONFIG.ENDPOINTS.AUTH.CHECK_EMAIL}?email=${encodeURIComponent(email)}`,
                    { showError: false }
                );

                if (emailCheckResponse.data.exists) {
                    APIUtils.showErrorMessage('Email already registered. Please login or use a different email.');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    return;
                }

                // Create signup payload
                const signupData = {
                    userType,
                    donorType: userType === 'donor' ? donorType : null,
                    fullName,
                    email,
                    password,
                    city,
                    phone: phone || null
                };

                // Send signup request
                const response = await APIUtils.post(
                    API_CONFIG.ENDPOINTS.AUTH.SIGNUP,
                    signupData,
                    { showError: true }
                );

                if (response.data.user) {
                    APIUtils.showSuccessMessage('Account created successfully! Redirecting to login...');

                    // Redirect to login page after delay
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                } else {
                    APIUtils.showErrorMessage('Unexpected response from server');
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }

            } catch (error) {
                console.error('Signup error:', error);
                
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

                // Handle specific error cases
                if (error.status === 400) {
                    APIUtils.showErrorMessage('Invalid data provided. Please check your inputs.');
                } else if (error.status === 409) {
                    APIUtils.showErrorMessage('Email already registered.');
                }
            }
        });
    }
;