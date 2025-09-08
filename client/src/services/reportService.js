import api from './api';

const reportService = {
  // Get student reports
  getStudentReports: async (params = {}) => {
    const response = await api.get('/reports/students', { params });
    return response.data;
  },

  // Get attendance reports
  getAttendanceReports: async (params = {}) => {
    const response = await api.get('/reports/attendance', { params });
    return response.data;
  },

  // Get grade reports
  getGradeReports: async (params = {}) => {
    const response = await api.get('/reports/grades', { params });
    return response.data;
  },

  // Get fee reports
  getFeeReports: async (params = {}) => {
    const response = await api.get('/reports/fees', { params });
    return response.data;
  },

  // Get class reports
  getClassReports: async (params = {}) => {
    const response = await api.get('/reports/classes', { params });
    return response.data;
  },

  // Get teacher reports
  getTeacherReports: async (params = {}) => {
    const response = await api.get('/reports/teachers', { params });
    return response.data;
  },

  // Generate PDF report
  generatePDFReport: async (reportType, params = {}) => {
    const response = await api.get(`/reports/pdf/${reportType}`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Generate Excel report
  generateExcelReport: async (reportType, params = {}) => {
    const response = await api.get(`/reports/excel/${reportType}`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    const response = await api.get('/reports/dashboard-stats');
    return response.data;
  }
};

export default reportService;
