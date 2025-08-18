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

export const getServiceReportDetail = async (reportId) => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/service-reports/${reportId}/details`);
    return response.data;
  } catch (error) {
    console.error('Error fetching service report detail:', error);
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

/**
 * Create customer record for a machine
 */
export const createCustomerRecord = async (customerData) => {
  prepareRequest();
  try {
    const response = await axios.post(`${API_URL}/service-reports/customer`, customerData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating customer record:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const downloadServiceReportPDF = async (reportId) => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/service-reports/${reportId}/pdf`, {
      responseType: 'blob'
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Extract filename from response headers or use default
    const contentDisposition = response.headers['content-disposition'];
    let filename = `service_report_${reportId.substring(0, 8)}.pdf`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

