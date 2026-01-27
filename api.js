/**
 * API Utility Module for FeedLink
 * Handles all API calls to the backend
 */

const APIUtils = {
    // Configuration
    BASE_URL: 'http://localhost:5000/api', // Change this to your backend URL
    TIMEOUT: 10000, // 10 seconds

    /**
     * Make API request with error handling
     */
    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            timeout: this.TIMEOUT,
            ...options,
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error(`API Request failed: ${endpoint}`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * GET Request
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    /**
     * POST Request
     */
    async post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        });
    },

    /**
     * PUT Request
     */
    async put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        });
    },

    /**
     * DELETE Request
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    /**
     * Fetch featured food donations
     */
    async getFeaturedDonations() {
        return this.get('/donations/featured');
    },

    /**
     * Fetch nearby donations by coordinates
     */
    async getNearbyDonations(latitude, longitude, radius = 10) {
        return this.get(`/donations/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
    },

    /**
     * Fetch dashboard statistics
     */
    async getDashboardStatistics() {
        return this.get('/statistics/dashboard');
    },

    /**
     * Request food pickup
     */
    async requestPickup(donationId) {
        return this.post(`/donations/${donationId}/request-pickup`, {});
    },

    /**
     * Login user
     */
    async login(email, password, userType) {
        return this.post('/auth/login', { email, password, userType });
    },

    /**
     * Sign up user
     */
    async signup(userData) {
        return this.post('/auth/signup', userData);
    },

    /**
     * Create food donation
     */
    async createDonation(donationData) {
        return this.post('/donations/create', donationData);
    },

    /**
     * Get NGOs nearby
     */
    async getNearbyNGOs(latitude, longitude, radius = 10) {
        return this.get(`/ngos/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
    },

    /**
     * Show error message to user
     */
    showErrorMessage(message) {
        // Create error alert
        const errorDiv = document.createElement('div');
        errorDiv.className = 'api-error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #f44336;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    },

    /**
     * Show success message to user
     */
    showSuccessMessage(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'api-success-message';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 9999;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        document.body.appendChild(successDiv);
        
        setTimeout(() => successDiv.remove(), 5000);
    },

    /**
     * Show loading state
     */
    showLoading() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'api-loading';
        loadingDiv.id = 'api-loading-overlay';
        loadingDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px;"></i>
                <span>Loading...</span>
            </div>
        `;
        loadingDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 30px 50px;
            border-radius: 10px;
            z-index: 10000;
        `;
        document.body.appendChild(loadingDiv);
    },

    /**
     * Hide loading state
     */
    hideLoading() {
        const loadingDiv = document.getElementById('api-loading-overlay');
        if (loadingDiv) loadingDiv.remove();
    },

    /**
     * Get nearby NGOs based on coordinates
     */
    async getNearbyNGOs(data) {
        return this.post('/locations/nearby-ngos', data);
    },

    /**
     * Get nearby Donors based on coordinates
     */
    async getNearbyDonors(data) {
        return this.post('/locations/nearby-donors', data);
    },
};
