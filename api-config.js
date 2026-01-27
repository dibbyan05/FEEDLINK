/**
 * FeedLink API Configuration
 * Central configuration for all API endpoints and settings
 */

const API_CONFIG = {
    // Change this to your backend URL in production
    BASE_URL: localStorage.getItem('apiBaseUrl') || 'http://localhost:5000/api',
    
    // API Endpoints
    ENDPOINTS: {
        // Authentication
        AUTH: {
            LOGIN: '/auth/login',
            SIGNUP: '/auth/signup',
            LOGOUT: '/auth/logout',
            VERIFY_EMAIL: '/auth/verify-email',
            FORGOT_PASSWORD: '/auth/forgot-password',
            RESET_PASSWORD: '/auth/reset-password',
            REFRESH_TOKEN: '/auth/refresh-token',
            CHECK_EMAIL: '/auth/check-email-exists',
            VALIDATE_TOKEN: '/auth/validate-token'
        },
        
        // Users & Profiles
        USERS: {
            PROFILE: '/users/profile',
            GET_USER: '/users/{id}',
            UPDATE_PROFILE: '/users/profile'
        },
        
        // Donations
        DONATIONS: {
            CREATE: '/donations/create',
            GET_FEATURED: '/donations/featured',
            GET_NEARBY: '/donations/nearby',
            GET_DETAIL: '/donations/{id}',
            UPDATE: '/donations/{id}',
            DELETE: '/donations/{id}',
            MY_DONATIONS: '/donations/my-donations',
            REQUEST_PICKUP: '/donations/{id}/request-pickup',
            UPLOAD_IMAGE: '/donations/upload-image',
            GET_REQUESTS: '/donations/{id}/requests'
        },
        
        // NGOs
        NGOS: {
            GET_NEARBY: '/ngos/nearby',
            SEARCH: '/ngos/search',
            GET_DETAIL: '/ngos/{id}',
            FOLLOW: '/ngos/{id}/follow',
            UNFOLLOW: '/ngos/{id}/follow',
            GET_STATISTICS: '/ngos/{id}/statistics'
        },
        
        // Statistics
        STATISTICS: {
            DASHBOARD: '/statistics/dashboard',
            USER: '/statistics/user/{id}',
            NGO: '/statistics/ngo/{id}'
        },
        
        // Newsletter
        NEWSLETTER: {
            SUBSCRIBE: '/newsletter/subscribe',
            UNSUBSCRIBE: '/newsletter/unsubscribe'
        }
    },
    
    // HTTP Headers
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    
    // Token storage key
    TOKEN_KEY: 'feedlink_auth_token',
    USER_KEY: 'feedlink_user_data',
    
    // Request timeout (ms)
    TIMEOUT: 10000,
    
    // Geolocation settings
    GEOLOCATION: {
        TIMEOUT: 10000,
        MAX_AGE: 0,
        ENABLE_HIGH_ACCURACY: true
    }
};

// Make it globally available
window.API_CONFIG = API_CONFIG;
