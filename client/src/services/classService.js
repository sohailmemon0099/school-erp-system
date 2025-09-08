import api from './api';

const classService = {
  // Get all classes
  getClasses: async (params = {}) => {
    const response = await api.get('/classes', { params });
    return response.data;
  },

  // Get single class
  getClass: async (id) => {
    const response = await api.get(`/classes/${id}`);
    return response.data;
  },

  // Create new class
  createClass: async (classData) => {
    const response = await api.post('/classes', classData);
    return response.data;
  },

  // Update class
  updateClass: async (id, classData) => {
    const response = await api.put(`/classes/${id}`, classData);
    return response.data;
  },

  // Delete class
  deleteClass: async (id) => {
    const response = await api.delete(`/classes/${id}`);
    return response.data;
  },

  // Get class statistics
  getClassStats: async (id) => {
    const response = await api.get(`/classes/${id}/stats`);
    return response.data;
  }
};

export default classService;
