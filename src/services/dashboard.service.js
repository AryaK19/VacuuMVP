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

export const getDashboardStatistics = async () => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/dashboard/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const getRecentActivities = async (params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/dashboard/recent-activities`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};





export const getServiceTypeStatistics = async () => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/dashboard/service-type-statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service type statistics:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};
export const getPartNumberStatistics = async () => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/dashboard/part-number-statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching part number statistics:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};



