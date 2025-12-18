import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
};

export const influencerAPI = {
  getAll: (filters = {}) => api.get('/influencers', { params: filters }),
  getById: (id) => api.get(`/influencers/${id}`),
  create: (data) => api.post('/influencers', data),
  update: (id, data) => api.put(`/influencers/${id}`, data),
};

export const companyAPI = {
  addFavorite: (influencerId) => api.post(`/companies/favorites/${influencerId}`),
  removeFavorite: (influencerId) => api.delete(`/companies/favorites/${influencerId}`),
  getFavorites: () => api.get('/companies/favorites'),
};

export default api;