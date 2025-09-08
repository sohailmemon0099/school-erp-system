import api from './api';

const bonafideCertificateService = {
  // Create a new bonafide certificate
  createBonafideCertificate: async (data) => {
    const response = await api.post('/bonafide-certificates', data);
    return response.data;
  },

  // Get all bonafide certificates with pagination and filters
  getBonafideCertificates: async (params = {}) => {
    const response = await api.get('/bonafide-certificates', { params });
    return response.data;
  },

  // Get bonafide certificate by ID
  getBonafideCertificateById: async (id) => {
    const response = await api.get(`/bonafide-certificates/${id}`);
    return response.data;
  },

  // Update bonafide certificate
  updateBonafideCertificate: async (id, data) => {
    const response = await api.put(`/bonafide-certificates/${id}`, data);
    return response.data;
  },

  // Delete bonafide certificate
  deleteBonafideCertificate: async (id) => {
    const response = await api.delete(`/bonafide-certificates/${id}`);
    return response.data;
  },

  // Issue bonafide certificate
  issueBonafideCertificate: async (id) => {
    const response = await api.post(`/bonafide-certificates/${id}/issue`);
    return response.data;
  },

  // Get certificate statistics
  getCertificateStats: async () => {
    const response = await api.get('/bonafide-certificates/stats');
    return response.data;
  }
};

export { bonafideCertificateService };
