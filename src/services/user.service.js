import axios from 'axios';
import config from '../config/api.config';
import { getCurrentSession, setAuthHeader } from './auth.service';

const API_URL = config.apiUrl;

// Set auth header before making requests
const prepareRequest = () => {
  const session = getCurrentSession();
  if (session && session.access_token) {
    setAuthHeader(session.access_token);
  }
};

export const getAdmins = async (params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/users/admins`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const getDistributors = async (params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/users/distributers`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching distributors:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Delete a user (admin or distributor)
 */
export const deleteUser = async (userId) => {
  prepareRequest();
  try {
    const response = await axios.delete(`${API_URL}/users/${userId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};
