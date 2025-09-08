import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const markDistributionService = {
  // Mark Distribution CRUD operations
  getMarkDistributions: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/mark-distributions`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getMarkDistributionById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/mark-distributions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  createMarkDistribution: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/mark-distributions`, data, {
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

  updateMarkDistribution: async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/mark-distributions/${id}`, data, {
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

  deleteMarkDistribution: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/mark-distributions/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Mark Distribution Statistics
  getMarkDistributionStats: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/mark-distributions/stats`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Grade Calculation operations
  calculateGrades: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/mark-distributions/calculate-grades`, data, {
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

  getGradeCalculations: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/mark-distributions/grade-calculations`, {
        params,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default markDistributionService;
