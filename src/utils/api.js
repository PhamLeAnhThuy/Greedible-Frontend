/**
 * API utility functions
 * Base URL is loaded from environment variable API_URL
 */

const getBaseURL = () => {
  // React requires REACT_APP_ prefix for environment variables
  // But we also check for API_URL as a fallback (though it won't work in React without the prefix)
  return process.env.REACT_APP_API_URL || process.env.API_URL || 'https://greedible-backend.vercel.app';
};

/**
 * Get the full API URL for an endpoint
 * @param {string} endpoint - The API endpoint path (e.g., '/api/customers/signin')
 * @returns {string} Full URL
 */
export const getAPIUrl = (endpoint) => {
  const baseURL = getBaseURL();
  // Remove leading slash from endpoint if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseURL}${cleanEndpoint}`;
};

/**
 * Make an authenticated API request
 * @param {string} endpoint - The API endpoint path
 * @param {object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Response>}
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getAPIUrl(endpoint);
  const config = {
    ...options,
    headers,
  };

  return fetch(url, config);
};

export default {
  getBaseURL,
  getAPIUrl,
  apiRequest,
};

