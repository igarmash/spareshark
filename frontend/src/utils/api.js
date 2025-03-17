// utils/api.js - Service to interact with the backend API
// When running in containers, use relative path which will be proxied by nginx
const API_BASE_URL = '/api';

// Function to get authentication token from local storage
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('spareshark-auth'));
  return user ? user.token : null;
};

// Generic API request function
const apiRequest = async (url, method = 'GET', data = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    // For non-2xx responses, throw an error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Ein Fehler ist aufgetreten');
    }
    
    // For 204 No Content responses, return null
    if (response.status === 204) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API calls
export const loginUser = (credentials) => {
  return apiRequest('/auth/login', 'POST', credentials);
};

export const registerUser = (userData) => {
  return apiRequest('/auth/register', 'POST', userData);
};

// Transaction API calls
export const getAllTransactions = () => {
  return apiRequest('/transactions');
};

export const getTransactionsByMonth = (year, month) => {
  return apiRequest(`/transactions/monthly?year=${year}&month=${month}`);
};

export const createTransaction = (transaction) => {
  return apiRequest('/transactions', 'POST', transaction);
};

export const updateTransaction = (id, transaction) => {
  return apiRequest(`/transactions/${id}`, 'PUT', transaction);
};

export const deleteTransaction = (id) => {
  return apiRequest(`/transactions/${id}`, 'DELETE');
};

export const getTotalBalance = () => {
  return apiRequest('/transactions/balance');
};

export const getMonthlyBalance = (year, month) => {
  return apiRequest(`/transactions/balance/monthly?year=${year}&month=${month}`);
};

export const getAvailableYears = () => {
  return apiRequest('/transactions/years');
};

// Category API calls
export const getAllCategories = () => {
  return apiRequest('/categories');
};

export const getCategoriesByType = (type) => {
  return apiRequest(`/categories/${type}`);
};

export const createCategory = (category) => {
  return apiRequest('/categories', 'POST', category);
};

export const deleteCategory = (id) => {
  return apiRequest(`/categories/${id}`, 'DELETE');
};