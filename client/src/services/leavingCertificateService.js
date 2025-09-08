import api from './api';

const leavingCertificateService = {
  // Create a new leaving certificate
  createLeavingCertificate: async (data) => {
    const response = await api.post('/leaving-certificates', data);
    return response.data;
  },

  // Get all leaving certificates with pagination and filters
  getLeavingCertificates: async (params = {}) => {
    const response = await api.get('/leaving-certificates', { params });
    return response.data;
  },

  // Get leaving certificate by ID
  getLeavingCertificateById: async (id) => {
    const response = await api.get(`/leaving-certificates/${id}`);
    return response.data;
  },

  // Update leaving certificate
  updateLeavingCertificate: async (id, data) => {
    const response = await api.put(`/leaving-certificates/${id}`, data);
    return response.data;
  },

  // Delete leaving certificate
  deleteLeavingCertificate: async (id) => {
    const response = await api.delete(`/leaving-certificates/${id}`);
    return response.data;
  },

  // Issue leaving certificate
  issueLeavingCertificate: async (id) => {
    const response = await api.post(`/leaving-certificates/${id}/issue`);
    return response.data;
  },

  // Get certificate statistics
  getCertificateStats: async () => {
    const response = await api.get('/leaving-certificates/stats');
    return response.data;
  }
};

export { leavingCertificateService };
