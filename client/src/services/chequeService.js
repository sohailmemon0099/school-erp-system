import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const chequeService = {
  // Get all cheques
  getCheques: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/cheques`, {
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

  // Get cheque by ID
  getChequeById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/cheques/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create cheque
  createCheque: async (chequeData) => {
    try {
      const response = await axios.post(`${API_URL}/cheques`, chequeData, {
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

  // Update cheque status
  updateChequeStatus: async (id, statusData) => {
    try {
      const response = await axios.put(`${API_URL}/cheques/${id}/status`, statusData, {
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

  // Delete cheque
  deleteCheque: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/cheques/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get cheque statistics
  getChequeStats: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/cheques/stats`, {
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

  // Validate cheque
  validateCheque: async (validationData) => {
    try {
      const response = await axios.post(`${API_URL}/cheques/validate`, validationData, {
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

  // Get pending cheques
  getPendingCheques: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/cheques/pending`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        params
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default chequeService;
