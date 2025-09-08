import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const transactionLogService = {
  // Get all transaction logs
  getTransactionLogs: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/transaction-logs`, {
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

  // Get transaction log by ID
  getTransactionLogById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/transaction-logs/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create transaction log
  createTransactionLog: async (transactionData) => {
    try {
      const response = await axios.post(`${API_URL}/transaction-logs`, transactionData, {
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

  // Update transaction status
  updateTransactionStatus: async (id, statusData) => {
    try {
      const response = await axios.put(`${API_URL}/transaction-logs/${id}/status`, statusData, {
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

  // Get transaction statistics
  getTransactionStats: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/transaction-logs/stats`, {
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

  // Export transaction logs
  exportTransactionLogs: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/transaction-logs/export`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default transactionLogService;
