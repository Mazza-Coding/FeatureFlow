import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post('/api/auth/refresh/', {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const featuresApi = {
  getAll: () => api.get('/api/features/'),
  getOne: (id) => api.get(`/api/features/${id}/`),
  create: (data) => api.post('/api/features/', data),
  update: (id, data) => api.patch(`/api/features/${id}/`, data),
  delete: (id) => api.delete(`/api/features/${id}/`),
  changeStatus: (id, status, justification) =>
    api.post(`/api/features/${id}/change_status/`, { status, justification }),
};

export const commentsApi = {
  getAll: (featureId) => api.get(`/api/features/${featureId}/comments/`),
  create: (featureId, data) => api.post(`/api/features/${featureId}/comments/`, data),
};

export const activitiesApi = {
  getAll: (featureId) => api.get(`/api/features/${featureId}/activities/`),
};

export default api;
