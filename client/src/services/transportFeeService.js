import api from './api';

const transportFeeService = {
  // Get all transport fees
  getAllTransportFees: async (params = {}) => {
    const response = await api.get('/transport-fees', { params });
    return response.data;
  },

  // Get single transport fee
  getTransportFeeById: async (id) => {
    const response = await api.get(`/transport-fees/${id}`);
    return response.data;
  },

  // Create new transport fee
  createTransportFee: async (transportFeeData) => {
    const response = await api.post('/transport-fees', transportFeeData);
    return response.data;
  },

  // Update transport fee
  updateTransportFee: async (id, transportFeeData) => {
    const response = await api.put(`/transport-fees/${id}`, transportFeeData);
    return response.data;
  },

  // Delete transport fee
  deleteTransportFee: async (id) => {
    const response = await api.delete(`/transport-fees/${id}`);
    return response.data;
  },

  // Record payment
  recordPayment: async (transportFeeId, paymentData) => {
    const response = await api.post(`/transport-fees/${transportFeeId}/payments`, paymentData);
    return response.data;
  },

  // Get transport fee statistics
  getTransportFeeStats: async (params = {}) => {
    const response = await api.get('/transport-fees/stats', { params });
    return response.data;
  },

  // Get transport payments
  getTransportPayments: async (params = {}) => {
    const response = await api.get('/transport-fees/payments', { params });
    return response.data;
  }
};

export { transportFeeService };
