import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData)
};

// Shareholder services
const shareholderService = {
  getAll: (params) => api.get('/shareholders', { params }),
  getById: (id) => api.get(`/shareholders/${id}`),
  getWithEquity: (id) => api.get(`/shareholders/${id}/equity`),
  create: (shareholderData) => api.post('/shareholders', shareholderData),
  update: (id, shareholderData) => api.put(`/shareholders/${id}`, shareholderData),
  delete: (id) => api.delete(`/shareholders/${id}`),
  getCapTable: () => api.get('/shareholders/captable')
};

// Share Class services
const shareClassService = {
  getAll: () => api.get('/share-classes'),
  getAllWithTotals: () => api.get('/share-classes/with-totals'),
  getById: (id) => api.get(`/share-classes/${id}`),
  getWithTotals: (id) => api.get(`/share-classes/${id}/with-totals`),
  create: (shareClassData) => api.post('/share-classes', shareClassData),
  update: (id, shareClassData) => api.put(`/share-classes/${id}`, shareClassData),
  delete: (id) => api.delete(`/share-classes/${id}`)
};

// Stock Option services
const stockOptionService = {
  getAll: (params) => api.get('/options', { params }),
  getById: (id) => api.get(`/options/${id}`),
  getVestingDetails: (id) => api.get(`/options/${id}/vesting`),
  getExerciseHistory: (id) => api.get(`/options/${id}/exercises`),
  create: (optionData) => api.post('/options', optionData),
  update: (id, optionData) => api.put(`/options/${id}`, optionData),
  cancel: (id) => api.put(`/options/${id}/cancel`),
  exercise: (id, exerciseData) => api.post(`/options/${id}/exercise`, exerciseData)
};

// Vesting Schedule services
const vestingScheduleService = {
  getAll: () => api.get('/vesting-schedules'),
  getById: (id) => api.get(`/vesting-schedules/${id}`),
  getUsageStats: (id) => api.get(`/vesting-schedules/${id}/stats`),
  create: (scheduleData) => api.post('/vesting-schedules', scheduleData),
  update: (id, scheduleData) => api.put(`/vesting-schedules/${id}`, scheduleData),
  delete: (id) => api.delete(`/vesting-schedules/${id}`)
};

// Option Plan services
const optionPlanService = {
  getAll: () => api.get('/option-plans'),
  getById: (id) => api.get(`/option-plans/${id}`),
  getWithGrants: (id) => api.get(`/option-plans/${id}/grants`),
  create: (planData) => api.post('/option-plans', planData),
  update: (id, planData) => api.put(`/option-plans/${id}`, planData),
  updateShares: (id, sharesData) => api.put(`/option-plans/${id}/shares`, sharesData),
  delete: (id) => api.delete(`/option-plans/${id}`)
};

// Report services
const reportService = {
  getCapTableReport: () => api.get('/reports/captable'),
  getOptionGrantsReport: () => api.get('/reports/options'),
  getVestingReport: () => api.get('/reports/vesting'),
  exportCapTableCSV: () => api.get('/reports/export/captable', { responseType: 'blob' }),
  importCapTableExcel: (formData) => {
    return api.post('/reports/import/captable', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};

export {
  api,
  authService,
  shareholderService,
  shareClassService,
  stockOptionService,
  vestingScheduleService,
  optionPlanService,
  reportService
};
