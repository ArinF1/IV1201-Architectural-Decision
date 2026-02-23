import axios from 'axios';

// Auto-detect production: if running on Heroku, use relative path (same origin)
// In development, use VITE_API_URL or localhost
const isProduction = window.location.hostname.includes('herokuapp.com');
const API_BASE_URL = isProduction
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'http://localhost:3000/api');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth tokens if needed
apiClient.interceptors.request.use(
  function (config) {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject(new Error('No response from server'));
    } else {
      // Something else happened
      return Promise.reject(error);
    }
  }
);

export const applicationAPI = {
  /**
   * Submit a new application
   * @param {Object} applicationData - The application data
   * @returns {Promise} Response with created application
   */
  submitApplication: function (applicationData) {
    return apiClient.post('/applications', applicationData);
  },

  /**
   * Get all applications with optional filters and sort
   * @param {number} page - Page number (1-indexed)
   * @param {number} pageSize - Items per page
   * @param {boolean} hideEmpty - Hide empty applications
   * @param {Object} filters - { sortBy, competence, status, minExperience, availFrom, availTo }
   * @returns {Promise} Response with paginated applications
   */
  getApplications: function (page = 1, pageSize = 10, hideEmpty = true, filters = {}) {
    const { sortBy, competence, status, minExperience, availFrom, availTo } = filters;
    return apiClient.get('/applications', {
      params: {
        page,
        pageSize,
        hideEmpty,
        ...(sortBy              && { sortBy }),
        ...(competence          && { competence }),
        ...(status && status !== 'all' && { status }),
        ...(minExperience       && { minExperience }),
        ...(availFrom           && { availFrom }),
        ...(availTo             && { availTo }),
      },
    });
  },

  /**
   * Get all available competencies
   * @returns {Promise} Response with list of competencies
   */
  getCompetencies: function () {
    return apiClient.get('/applications/competencies');
  },

  /**
   * Update application status
   * @param {number} applicationId - The ID of the application
   * @param {string} status - The new status ('accepted' or 'rejected')
   * @returns {Promise} Response with updated application
   */
  updateApplicationStatus: function (applicationId, status) {
    return apiClient.patch(`/applications/${applicationId}/status`, { status });
  },

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Response with created user
   */
  registerUser: function (userData) {
    return apiClient.post('/users', userData);
  },

  /**
   * Login user
   * @param {Object} credentials - Username and password
   * @returns {Promise} Response with user data
   */
  loginUser: function (credentials) {
    return apiClient.post('/users/login', credentials);
  },

  /**
   * Auto-process unhandled applications
   * @returns {Promise} Response with processing results
   */
  autoProcessApplications: function () {
    return apiClient.post('/applications/auto-process');
  },

  /**
   * Logout user (clears auth cookie on server)
   * @returns {Promise} Response confirming logout
   */
  logoutUser: function () {
    return apiClient.post('/users/logout');
  },


};

export default apiClient;
