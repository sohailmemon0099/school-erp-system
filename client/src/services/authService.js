import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add a unique request ID to prevent duplicate requests
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration - DISABLED automatic logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Response Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - Current path:', window.location.pathname);
      console.log('401 Error - NOT redirecting automatically, letting AuthContext handle it');
      
      // DISABLED: No automatic logout or redirect
      // Let the AuthContext handle logout manually
      // This prevents multi-tab logout issues
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
};

export const studentService = {
  getStudents: (params) => api.get('/students', { params }),
  getStudent: (id) => api.get(`/students/${id}`),
  createStudent: (data) => api.post('/students', data),
  updateStudent: (id, data) => api.put(`/students/${id}`, data),
  deleteStudent: (id) => api.delete(`/students/${id}`),
  getStudentGrades: (id) => api.get(`/students/${id}/grades`),
  getStudentAttendance: (id, params) => api.get(`/students/${id}/attendance`, { params }),
  getStudentFees: (id) => api.get(`/students/${id}/fees`),
  getStudentStats: (id) => api.get(`/students/${id}/stats`),
};

export const teacherService = {
  getTeachers: (params) => api.get('/teachers', { params }),
  getTeacher: (id) => api.get(`/teachers/${id}`),
  createTeacher: (data) => api.post('/teachers', data),
  updateTeacher: (id, data) => api.put(`/teachers/${id}`, data),
  deleteTeacher: (id) => api.delete(`/teachers/${id}`),
  assignClasses: (id, classIds) => api.post(`/teachers/${id}/assign-classes`, { classIds }),
  assignSubjects: (id, subjectIds) => api.post(`/teachers/${id}/assign-subjects`, { subjectIds }),
};

export const classService = {
  getClasses: (params) => api.get('/classes', { params }),
  getClass: (id) => api.get(`/classes/${id}`),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  getClassStats: (id) => api.get(`/classes/${id}/stats`),
};

export const subjectService = {
  getSubjects: (params) => api.get('/subjects', { params }),
  getSubject: (id) => api.get(`/subjects/${id}`),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),
};

export const attendanceService = {
  getAttendance: (params) => api.get('/attendance', { params }),
  getAttendanceRecord: (id) => api.get(`/attendance/${id}`),
  createAttendance: (data) => api.post('/attendance', data),
  bulkCreateAttendance: (data) => api.post('/attendance/bulk', data),
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/attendance/${id}`),
  getAttendanceStats: (params) => api.get('/attendance/stats', { params }),
};

export const gradeService = {
  getGrades: (params) => api.get('/grades', { params }),
  getGrade: (id) => api.get(`/grades/${id}`),
  createGrade: (data) => api.post('/grades', data),
  updateGrade: (id, data) => api.put(`/grades/${id}`, data),
  deleteGrade: (id) => api.delete(`/grades/${id}`),
  getGradeStats: (params) => api.get('/grades/stats', { params }),
};

export const feeService = {
  getFees: (params) => api.get('/fees', { params }),
  getFee: (id) => api.get(`/fees/${id}`),
  createFee: (data) => api.post('/fees', data),
  updateFee: (id, data) => api.put(`/fees/${id}`, data),
  payFee: (id, data) => api.put(`/fees/${id}/pay`, data),
  deleteFee: (id) => api.delete(`/fees/${id}`),
  getFeeStats: (params) => api.get('/fees/stats', { params }),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getAttendanceChart: (params) => api.get('/dashboard/attendance-chart', { params }),
  getGradeDistribution: (params) => api.get('/dashboard/grade-distribution', { params }),
  getFeeCollection: (params) => api.get('/dashboard/fee-collection', { params }),
  getClassPerformance: () => api.get('/dashboard/class-performance'),
};

export const reportService = {
  generateStudentReport: (id, params) => api.get(`/reports/student/${id}`, { params }),
  generateClassReport: (id, params) => api.get(`/reports/class/${id}`, { params }),
  generateAttendanceReport: (params) => api.get('/reports/attendance', { params }),
  generateFeeReport: (params) => api.get('/reports/fees', { params }),
};

export default api;
