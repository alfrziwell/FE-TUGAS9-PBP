import apiClient from './axios';

/**
 * Register a new user.
 * 
 * @param {string} nama_lengkap 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object>} response data
 */
export const register = async (nama_lengkap, username, password) => {
  const response = await apiClient.post('/register', {
    nama_lengkap,
    username,
    password,
  });
  return response.data;
};

/**
 * Log in a user and store JWT token in localStorage.
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object>} response data
 */
export const login = async (username, password) => {
  const response = await apiClient.post('/login', {
    username,
    password,
  });
  if (response.data && response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

/**
 * Log out a user and remove JWT token.
 * 
 * @returns {Promise<object>} response data
 */
export const logout = async () => {
  try {
    const response = await apiClient.post('/logout');
    return response.data;
  } finally {
    localStorage.removeItem('token');
  }
};

/**
 * Get authenticated user profile.
 * 
 * @returns {Promise<object>} response data
 */
export const getProfile = async () => {
  const response = await apiClient.get('/me');
  return response.data;
};
