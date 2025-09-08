import api from './api';

const examService = {
  // Get all exams
  getExams: async (params = {}) => {
    const response = await api.get('/exams', { params });
    return response.data;
  },

  // Get exam by ID
  getExamById: async (id) => {
    const response = await api.get(`/exams/${id}`);
    return response.data;
  },

  // Create new exam
  createExam: async (examData) => {
    const response = await api.post('/exams', examData);
    return response.data;
  },

  // Update exam
  updateExam: async (id, examData) => {
    const response = await api.put(`/exams/${id}`, examData);
    return response.data;
  },

  // Delete exam
  deleteExam: async (id) => {
    const response = await api.delete(`/exams/${id}`);
    return response.data;
  },

  // Get exam statistics
  getExamStats: async (params = {}) => {
    const response = await api.get('/exams/stats', { params });
    return response.data;
  },

  // Create exam schedule
  createExamSchedule: async (scheduleData) => {
    const response = await api.post('/exams/schedules', scheduleData);
    return response.data;
  },

  // Get exam schedules
  getExamSchedules: async (params = {}) => {
    const response = await api.get('/exams/schedules/list', { params });
    return response.data;
  },

  // Generate hall tickets
  generateHallTickets: async (data) => {
    const response = await api.post('/exams/hall-tickets/generate', data);
    return response.data;
  },

  // Get hall tickets
  getHallTickets: async (params = {}) => {
    const response = await api.get('/exams/hall-tickets/list', { params });
    return response.data;
  }
};

export default examService;
