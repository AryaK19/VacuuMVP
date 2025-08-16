import axios from 'axios';
import config from '../config/api.config';

const API_URL = config.apiUrl;

export const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, userData);
    // Store all the response data including user info and session tokens
    if (response.data.success && response.data.session) {
      // Store the complete response
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('session', JSON.stringify(response.data.session));
      
      // Set the default Authorization header for all future requests
      setAuthHeader(response.data.session.access_token);
    }
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    // Enhanced error handling to properly extract the detailed error message
    if (error.response) {
      const errorData = error.response.data;
      // Check if there's a detail field which contains the specific error message
      if (errorData.detail) {
        throw { detail: errorData.detail, status: error.response.status };
      }
      throw errorData;
    }
    throw { message: 'Network error' };
  }
};

export const logout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('session');
  // Remove the auth header when logging out
  removeAuthHeader();
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

export const getCurrentSession = () => {
  return JSON.parse(localStorage.getItem('session'));
};

export const isAuthenticated = () => {
  const session = getCurrentSession();
  if (!session) return false;
  
  // Check if the token is expired
  const currentTime = Math.floor(Date.now() / 1000);
  return session.expires_at > currentTime;
};

// Set authentication header for axios
export const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

// Remove authentication header
export const removeAuthHeader = () => {
  delete axios.defaults.headers.common['Authorization'];
};

// Check and refresh token if needed
export const checkAndRefreshToken = async () => {
  const session = getCurrentSession();
  if (!session) return false;
  
  const currentTime = Math.floor(Date.now() / 1000);
  
  // If token is expired or close to expiration (within 5 minutes), refresh it
  if (session.expires_at - currentTime < 300) {
    try {
      // Implement token refresh logic
      const response = await axios.post(`${API_URL}/auth/refresh-token`, {
        refresh_token: session.refresh_token
      });
      
      if (response.data.session) {
        localStorage.setItem('session', JSON.stringify(response.data.session));
        setAuthHeader(response.data.session.access_token);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // If refresh fails, log out the user
      logout();
      return false;
    }
  }
  
  return true;
};


