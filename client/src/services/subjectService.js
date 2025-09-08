import api from './api';

const subjectService = {
  // Get all subjects
  getSubjects: async (params = {}) => {
    const response = await api.get('/subjects', { params });
    return response.data;
  },

  // Get single subject
  getSubject: async (id) => {
    const response = await api.get(`/subjects/${id}`);
    return response.data;
  },

  // Create new subject
  createSubject: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },

  // Update subject
  updateSubject: async (id, subjectData) => {
    const response = await api.put(`/subjects/${id}`, subjectData);
    return response.data;
  },

  // Delete subject
  deleteSubject: async (id) => {
    const response = await api.delete(`/subjects/${id}`);
    return response.data;
  },

  // Get subjects by class
  getClassSubjects: async (classId, params = {}) => {
    const response = await api.get(`/subjects/class/${classId}`, { params });
    return response.data;
  },

  // Get subjects by teacher
  getTeacherSubjects: async (teacherId, params = {}) => {
    const response = await api.get(`/subjects/teacher/${teacherId}`, { params });
    return response.data;
  }
};

export default subjectService;
