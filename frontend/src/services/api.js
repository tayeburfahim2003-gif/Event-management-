import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // send/receive the "remember me" cookie
});

// Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the token is invalid/expired, clear it and send the user to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const getErrorMessage = (err, fallback = 'Something went wrong') => {
  if (!err.response) {
    // Request never reached the server: backend down, CORS block, wrong API URL, etc.
    return 'Could not reach the server. Please check your connection and try again.';
  }
  const data = err.response.data;
  if (!data) return fallback;
  if (data.error) return data.error; // e.g. { success: false, error: "User already exists" }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    // express-validator shape: { success: false, errors: [{ msg, param, ... }] }
    return data.errors.map((e) => e.msg).join(', ');
  }
  return fallback;
};

export default API;
