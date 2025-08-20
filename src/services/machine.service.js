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

export const getSoldPumps = async (params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/machines/sold_pumps`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching pumps:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const getParts = async (params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/machines/parts`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching parts:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};
export const getPumps = async (params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/machines/pumps`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching pumps:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const createPump = async (formData) => {
  prepareRequest();
  try {
    const response = await axios.post(`${API_URL}/machines/pumps/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating pump:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

export const createPart = async (formData) => {
  prepareRequest();
  try {
    const response = await axios.post(`${API_URL}/machines/parts/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating part:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};


export const createSoldPump = async (formData) => {
  prepareRequest();
  try {
    console.log(formData);
    const response = await axios.post(`${API_URL}/machines/sold_pumps/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating part:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};




/**
 * Get detailed machine information
 */
export const getMachineDetails = async (machineId) => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/machines/sold/details/${machineId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching machine details:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Get service reports for a specific machine
 */
export const getMachineServiceReports = async (machineId, params = {}) => {
  prepareRequest();
  try {
    const defaultParams = {
      page: 1,
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'desc'
    };
    
    const queryParams = { ...defaultParams, ...params };
    
    const response = await axios.get(`${API_URL}/machines/${machineId}/service-reports`, { params: queryParams });
    return response.data;
  } catch (error) {
    console.error('Error fetching machine service reports:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Delete a machine (pump or part)
 */
export const deleteSoldMachine = async (machineId) => {
  prepareRequest();
  try {
    const response = await axios.delete(`${API_URL}/machines/sold_pumps/${machineId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting machine:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};


export const deleteMachine = async (machineId) => {
  prepareRequest();
  try {
    const response = await axios.delete(`${API_URL}/machines/${machineId}/delete`);
    return response.data;
  } catch (error) {
    console.error('Error deleting machine:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Update machine details
 */
export const updateMachine = async (machineId, formData) => {
  prepareRequest();
  try {
    const response = await axios.put(`${API_URL}/machines/${machineId}/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating machine:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};

/**
 * Get model number from part number
 * @param {string} partNo
 * @returns {Promise<{ success: boolean, model_no?: string }>}
 */
export const getModelFromPart = async (partNo) => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/machines/model-from-part`, {
      params: { part_no: partNo }
    });
    return response.data; // { success: true, model_no: "..." } or { success: false }
  } catch (error) {
    console.error('Error fetching model from part:', error);
    // Return a consistent format
    return { success: false };
  }
};

/**
 * Get customer names for autocomplete
 * @returns {Promise<{ customers: Array<{ customer_name: string, customer_contact?: string, customer_address?: string, customer_email?: string }> }>}
 */
export const getCustomerNames = async (search = "") => {
  prepareRequest();
  try {
    const response = await axios.get(`${API_URL}/machines/customers`, {
      params: search ? { search } : {},
    });
    return response.data; // { customers: [...] }
  } catch (error) {
    console.error('Error fetching customer names:', error);
    throw error.response ? error.response.data : { message: 'Network error' };
  }
};
