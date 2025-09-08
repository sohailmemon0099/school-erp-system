import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const attendanceReportService = {
  // Get all attendance reports
  getAttendanceReports: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/attendance-reports`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get attendance report by ID
  getAttendanceReportById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/attendance-reports/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Generate attendance report
  generateAttendanceReport: async (reportData) => {
    try {
      const response = await axios.post(`${API_URL}/attendance-reports/generate`, reportData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update attendance report
  updateAttendanceReport: async (id, updateData) => {
    try {
      const response = await axios.put(`${API_URL}/attendance-reports/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete attendance report
  deleteAttendanceReport: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/attendance-reports/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get attendance report statistics
  getAttendanceReportStats: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/attendance-reports/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Export attendance report
  exportAttendanceReport: async (id, format = 'json') => {
    try {
      const response = await axios.get(`${API_URL}/attendance-reports/${id}/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default attendanceReportService;
