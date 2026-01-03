import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear tokens on unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('role');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (email, password, fullName, phone, jobTitle, department) => {
    const response = await api.post('/auth/register', { 
      email, 
      password, 
      fullName, 
      phone, 
      jobTitle, 
      department 
    });
    return response.data;
  },
};

// Employee API
export const employeeAPI = {
  getProfile: async () => {
    const response = await api.get('/employee/profile');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.patch('/employee/profile', profileData);
    return response.data;
  },
  getDashboardStats: async () => {
    const response = await api.get('/employee/dashboard/stats');
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/employee/summary');
    return response.data;
  },
};

// Attendance API
export const attendanceAPI = {
  checkIn: async () => {
    const response = await api.post('/attendance/check-in');
    return response.data;
  },
  checkOut: async () => {
    const response = await api.post('/attendance/check-out');
    return response.data;
  },
  getToday: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },
  getHistory: async (limit = 30) => {
    const response = await api.get(`/attendance/history?limit=${limit}`);
    return response.data;
  },
  getCalendar: async (month, year) => {
    const response = await api.get(`/attendance/calendar?month=${month}&year=${year}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/attendance/stats');
    return response.data;
  },
};

// Leave API
export const leaveAPI = {
  apply: async (type, startDate, endDate, reason) => {
    const response = await api.post('/leave/apply', { type, startDate, endDate, reason });
    return response.data;
  },
  getMyLeaves: async () => {
    const response = await api.get('/leave/my');
    return response.data;
  },
  getBalance: async () => {
    const response = await api.get('/leave/balance');
    return response.data;
  },
  getPending: async () => {
    const response = await api.get('/leave/pending');
    return response.data;
  },
  getAll: async (status = 'ALL', type = 'ALL') => {
    const response = await api.get(`/leave/all?status=${status}&type=${type}`);
    return response.data;
  },
  updateStatus: async (leaveId, status, adminNote) => {
    const response = await api.patch(`/leave/${leaveId}/status`, { status, adminNote });
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },
  getWeeklyAttendance: async () => {
    const response = await api.get('/admin/dashboard/weekly-attendance');
    return response.data;
  },
  getDepartments: async () => {
    const response = await api.get('/admin/dashboard/departments');
    return response.data;
  },
  getEmployees: async () => {
    const response = await api.get('/admin/employees');
    return response.data;
  },
  createEmployee: async (employeeData) => {
    const response = await api.post('/admin/employees', employeeData);
    return response.data;
  },
  getDailyAttendance: async (date) => {
    const response = await api.get(`/admin/attendance/daily?date=${date}`);
    return response.data;
  },
  getActivity: async (limit = 10) => {
    const response = await api.get(`/admin/activity?limit=${limit}`);
    return response.data;
  },
};

export default api;

