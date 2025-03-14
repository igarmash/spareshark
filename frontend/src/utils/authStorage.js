// utils/authStorage.js - Updated to work with JWT from backend
import { loginUser as apiLoginUser, registerUser as apiRegisterUser } from './api';

const AUTH_KEY = 'finance-tracker-auth';

// Save user data with token to local storage
export const saveUser = (userData) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
};

// Get user data from local storage
export const getUser = () => {
  const userJson = localStorage.getItem(AUTH_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// Remove user data from local storage (logout)
export const removeUser = () => {
  localStorage.removeItem(AUTH_KEY);
};

// Login user using the API
export const loginUser = async (credentials) => {
  try {
    const response = await apiLoginUser(credentials);
    
    // Save user data with token
    saveUser(response);
    
    return response;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Register user using the API
export const registerUser = async (userData) => {
  try {
    const response = await apiRegisterUser(userData);
    
    // Save user data with token
    saveUser(response);
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};