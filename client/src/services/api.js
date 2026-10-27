import axios from 'axios';
import { addLog } from './apiLog';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.metadata = { startedAt: performance.now() };
  return config;
});

// If the token is rejected, the stored session is dead. Clear it and bounce to
// the login page so the UI never sits there looking "logged in" but empty.
api.interceptors.response.use(
  (response) => {
    const startedAt = response.config.metadata?.startedAt ?? performance.now();
    addLog({
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      duration: Math.round(performance.now() - startedAt),
      at: new Date(),
      request: response.config.data ? safeParse(response.config.data) : undefined,
      response: response.data,
    });
    return response;
  },
  (error) => {
    const config = error.config || {};
    const startedAt = config.metadata?.startedAt ?? performance.now();
    const status = error.response?.status;

    addLog({
      method: config.method?.toUpperCase(),
      url: config.url,
      status: status || 'ERR',
      duration: Math.round(performance.now() - startedAt),
      at: new Date(),
      request: config.data ? safeParse(config.data) : undefined,
      response: error.response?.data || { message: error.message },
      failed: true,
    });

    const url = config.url || '';
    const isAuthAttempt = url.includes('/api/auth/login') || url.includes('/api/auth/register');

    if (status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

function safeParse(value) {
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return value;
  }
}

// Auth
export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);
export const getMe = () => api.get('/api/auth/me');
export const updateProfile = (data) => api.put('/api/auth/profile', data);
export const changePassword = (data) => api.put('/api/auth/change-password', data);

// Equipment
export const getEquipment = (params) => api.get('/api/equipment', { params });
export const getEquipmentById = (id) => api.get(`/api/equipment/${id}`);
export const createEquipment = (data) => api.post('/api/equipment', data);
export const updateEquipment = (id, data) => api.put(`/api/equipment/${id}`, data);
export const deleteEquipment = (id) => api.delete(`/api/equipment/${id}`);

// Users
export const getUsers = () => api.get('/api/users');
export const createUser = (data) => api.post('/api/users', data);
export const updateUser = (id, data) => api.put(`/api/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/api/users/${id}`);

// Rentals
export const getRentals = () => api.get('/api/rentals');
export const getRentalStats = () => api.get('/api/rentals/stats');
export const createRental = (data) => api.post('/api/rentals', data);
export const updateRentalStatus = (id, status) => api.put(`/api/rentals/${id}/status`, { status });
export const deleteRental = (id) => api.delete(`/api/rentals/${id}`);

export default api;
