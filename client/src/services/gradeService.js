import api from './api';

const gradeService = {
  // Get all grades
  getGrades: async (params = {}) => {
    const response = await api.get('/grades', { params });
    return response.data;
  },

  // Get single grade
  getGrade: async (id) => {
    const response = await api.get(`/grades/${id}`);
    return response.data;
  },

  // Create new grade
  createGrade: async (gradeData) => {
    const response = await api.post('/grades', gradeData);
    return response.data;
  },

  // Update grade
  updateGrade: async (id, gradeData) => {
    const response = await api.put(`/grades/${id}`, gradeData);
    return response.data;
  },

  // Delete grade
  deleteGrade: async (id) => {
    const response = await api.delete(`/grades/${id}`);
    return response.data;
  },

  // Get grades by student
  getStudentGrades: async (studentId, params = {}) => {
    const response = await api.get(`/grades/student/${studentId}`, { params });
    return response.data;
  },

  // Get grades by subject
  getSubjectGrades: async (subjectId, params = {}) => {
    const response = await api.get(`/grades/subject/${subjectId}`, { params });
    return response.data;
  },

  // Get grades by class
  getClassGrades: async (classId, params = {}) => {
    const response = await api.get(`/grades/class/${classId}`, { params });
    return response.data;
  },

  // Get grade statistics
  getGradeStats: async (params = {}) => {
    const response = await api.get('/grades/stats', { params });
    return response.data;
  }
};

export default gradeService;
