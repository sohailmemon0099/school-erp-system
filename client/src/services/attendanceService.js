import api from './api';

const attendanceService = {
  // Get all attendance records
  getAttendance: async (params = {}) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  // Get single attendance record
  getAttendanceRecord: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  // Create new attendance record
  createAttendance: async (attendanceData) => {
    const response = await api.post('/attendance', attendanceData);
    return response.data;
  },

  // Update attendance record
  updateAttendance: async (id, attendanceData) => {
    const response = await api.put(`/attendance/${id}`, attendanceData);
    return response.data;
  },

  // Delete attendance record
  deleteAttendance: async (id) => {
    const response = await api.delete(`/attendance/${id}`);
    return response.data;
  },

  // Get attendance by student
  getStudentAttendance: async (studentId, params = {}) => {
    const response = await api.get(`/attendance/student/${studentId}`, { params });
    return response.data;
  },

  // Get attendance by class
  getClassAttendance: async (classId, params = {}) => {
    const response = await api.get(`/attendance/class/${classId}`, { params });
    return response.data;
  },

  // Get attendance statistics
  getAttendanceStats: async (params = {}) => {
    const response = await api.get('/attendance/stats', { params });
    return response.data;
  }
};

export default attendanceService;
