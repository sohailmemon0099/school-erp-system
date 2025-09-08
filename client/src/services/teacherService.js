import api from './api';

const teacherService = {
  // Get all teachers
  getTeachers: async (params = {}) => {
    const response = await api.get('/teachers', { params });
    return response.data;
  },

  // Get single teacher
  getTeacher: async (id) => {
    const response = await api.get(`/teachers/${id}`);
    return response.data;
  },

  // Create new teacher
  createTeacher: async (teacherData) => {
    // Use the new endpoint that creates both user and teacher
    const teacherPayload = {
      // User fields
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      email: teacherData.email,
      password: 'password123', // Default password, should be changed on first login
      phone: teacherData.phone,
      address: teacherData.address,
      dateOfBirth: teacherData.dateOfBirth,
      gender: teacherData.gender,
      
      // Teacher fields
      employeeId: teacherData.employeeId,
      hireDate: teacherData.hireDate || new Date().toISOString().split('T')[0],
      qualification: teacherData.qualification,
      specialization: teacherData.specialization,
      salary: teacherData.salary
    };
    
    const response = await api.post('/teachers/with-user', teacherPayload);
    return response.data;
  },

  // Update teacher
  updateTeacher: async (id, teacherData) => {
    // Include both user and teacher fields for updates
    const teacherPayload = {
      // User fields (for name, email, etc. updates)
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      email: teacherData.email,
      phone: teacherData.phone,
      address: teacherData.address,
      dateOfBirth: teacherData.dateOfBirth,
      gender: teacherData.gender,
      
      // Teacher fields
      employeeId: teacherData.employeeId,
      hireDate: teacherData.hireDate,
      qualification: teacherData.qualification,
      specialization: teacherData.specialization,
      salary: teacherData.salary
    };
    
    const response = await api.put(`/teachers/${id}`, teacherPayload);
    return response.data;
  },

  // Delete teacher
  deleteTeacher: async (id) => {
    const response = await api.delete(`/teachers/${id}`);
    return response.data;
  },

  // Get teacher classes
  getTeacherClasses: async (id) => {
    const response = await api.get(`/teachers/${id}/classes`);
    return response.data;
  },

  // Get teacher subjects
  getTeacherSubjects: async (id) => {
    const response = await api.get(`/teachers/${id}/subjects`);
    return response.data;
  },

  // Get teacher statistics
  getTeacherStats: async (id) => {
    const response = await api.get(`/teachers/${id}/stats`);
    return response.data;
  }
};

export default teacherService;
