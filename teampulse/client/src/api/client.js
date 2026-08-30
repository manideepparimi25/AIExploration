import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tp_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('tp_token');
        localStorage.removeItem('tp_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (body) => api.post('/api/auth/register', body).then((r) => r.data),
  login: (body) => api.post('/api/auth/login', body).then((r) => r.data),
  logout: () => api.post('/api/auth/logout').then((r) => r.data),
  me: () => api.get('/api/auth/me').then((r) => r.data),
};

export const taskApi = {
  list: (params) => api.get('/api/tasks', { params }).then((r) => r.data),
  get: (id) => api.get(`/api/tasks/${id}`).then((r) => r.data),
  create: (body) => api.post('/api/tasks', body).then((r) => r.data),
  update: (id, body) => api.patch(`/api/tasks/${id}`, body).then((r) => r.data),
  remove: (id) => api.delete(`/api/tasks/${id}`).then((r) => r.data),
  addComment: (id, body) => api.post(`/api/tasks/${id}/comments`, body).then((r) => r.data),
};

export const statusApi = {
  team: () => api.get('/api/statuses').then((r) => r.data),
  mine: () => api.get('/api/statuses/me').then((r) => r.data),
  save: (body) => api.post('/api/statuses', body).then((r) => r.data),
};

export const userApi = {
  list: () => api.get('/api/users').then((r) => r.data),
  me: () => api.get('/api/users/me').then((r) => r.data),
  updateMe: (body) => api.patch('/api/users/me', body).then((r) => r.data),
};
