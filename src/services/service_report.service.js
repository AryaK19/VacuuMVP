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

/**
 * Get service reports with filtering, pagination and sorting
 */
export const getServiceReports = async (params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/service-reports`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching service reports:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Create a new service report
 */
export const createServiceReport = async (formData) => {
  prepareRequest();
  try {
    const response = await axios.post(`${API_URL}/service-reports`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating service report:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Get service types for dropdown
 */
export const getServiceTypes = async () => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/service-reports/types`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service types:', error);
    // Fallback to static list if API fails
    return {
      success: true,
      service_types: [
        { id: '1', service_type: 'Maintenance' },
        { id: '2', service_type: 'Repair' },
        { id: '3', service_type: 'Installation' }
      ]
    };
  }
};

/**
 * Get machine information by serial number
 */
export const getMachineBySerial = async (serialNo) => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/service-reports/machine/${serialNo}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching machine by serial:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

