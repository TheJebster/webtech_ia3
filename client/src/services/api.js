import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (data) => api.post('/api/auth/login', data);
export const register = (data) => api.post('/api/auth/register', data);
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
export const createRental = (data) => api.post('/api/rentals', data);
export const updateRentalStatus = (id, status) => api.put(`/api/rentals/${id}/status`, { status });
export const deleteRental = (id) => api.delete(`/api/rentals/${id}`);

export default api;
