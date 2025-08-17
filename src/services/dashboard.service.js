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

export const getServiceReportDetail = async (reportId) => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/dashboard/service-report/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service report detail:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};