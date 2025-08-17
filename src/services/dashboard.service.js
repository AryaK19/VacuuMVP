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

export const downloadServiceReportPDF = async (reportId) => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/dashboard/service-report/${reportId}/download-pdf`, {
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

export const getDistributorStatistics = async () => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/dashboard/distributor-statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching distributor statistics:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};