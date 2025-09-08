import api from './api';

const classworkService = {
  // Get all classworks
  getAllClassworks: async (params = {}) => {
    const response = await api.get('/classworks', { params });
    return response.data;
  },

  // Get single classwork
  getClassworkById: async (id) => {
    const response = await api.get(`/classworks/${id}`);
    return response.data;
  },

  // Create new classwork
  createClasswork: async (classworkData) => {
    const response = await api.post('/classworks', classworkData);
    return response.data;
  },

  // Update classwork
  updateClasswork: async (id, classworkData) => {
    const response = await api.put(`/classworks/${id}`, classworkData);
    return response.data;
  },

  // Delete classwork
  deleteClasswork: async (id) => {
    const response = await api.delete(`/classworks/${id}`);
    return response.data;
  },

  // Submit classwork
  submitClasswork: async (classworkId, submissionData) => {
    const response = await api.post(`/classworks/${classworkId}/submit`, submissionData);
    return response.data;
  },

  // Grade submission
  gradeSubmission: async (submissionId, gradingData) => {
    const response = await api.put(`/classworks/submissions/${submissionId}/grade`, gradingData);
    return response.data;
  },

  // Get classwork statistics
  getClassworkStats: async (params = {}) => {
    const response = await api.get('/classworks/stats', { params });
    return response.data;
  }
};

export { classworkService };
