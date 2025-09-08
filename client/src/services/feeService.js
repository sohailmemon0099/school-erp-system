import api from './api';

const feeService = {
  // Fee Structure Management
  getFeeStructures: async (params = {}) => {
    const response = await api.get('/fees/structures', { params });
    return response.data;
  },

  getFeeStructure: async (id) => {
    const response = await api.get(`/fees/structures/${id}`);
    return response.data;
  },

  createFeeStructure: async (feeStructureData) => {
    const response = await api.post('/fees/structures', feeStructureData);
    return response.data;
  },

  updateFeeStructure: async (id, feeStructureData) => {
    const response = await api.put(`/fees/structures/${id}`, feeStructureData);
    return response.data;
  },

  deleteFeeStructure: async (id) => {
    const response = await api.delete(`/fees/structures/${id}`);
    return response.data;
  },

  // Fee Payment Management
  getFeePayments: async (params = {}) => {
    const response = await api.get('/fees/payments', { params });
    return response.data;
  },

  createFeePayment: async (paymentData) => {
    const response = await api.post('/fees/payments', paymentData);
    return response.data;
  },

  updateFeePayment: async (id, paymentData) => {
    const response = await api.put(`/fees/payments/${id}`, paymentData);
    return response.data;
  },

  // Fee Statistics
  getFeeStats: async (params = {}) => {
    const response = await api.get('/fees/stats', { params });
    return response.data;
  }
};

export default feeService;
