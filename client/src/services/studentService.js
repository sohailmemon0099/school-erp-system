import api from './api';

const studentService = {
  // Get all students
  getStudents: async (params = {}) => {
    const response = await api.get('/students', { params });
    return response.data;
  },

  // Get single student
  getStudent: async (id) => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },

  // Create new student
  createStudent: async (studentData) => {
    // Use the new endpoint that creates both user and student
    const studentPayload = {
      // User fields
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      password: 'password123', // Default password, should be changed on first login
      phone: studentData.phone,
      address: studentData.address,
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      
      // Student fields
      studentId: studentData.studentId,
      admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0],
      classId: studentData.classId,
      parentName: studentData.parentName,
      parentPhone: studentData.parentPhone,
      parentEmail: studentData.parentEmail,
      emergencyContact: studentData.emergencyContact,
      medicalInfo: studentData.medicalInfo,
      transportRoute: studentData.transportRoute
    };
    
    const response = await api.post('/students/with-user', studentPayload);
    return response.data;
  },

  // Update student
  updateStudent: async (id, studentData) => {
    // Include both user and student fields for updates
    const studentPayload = {
      // User fields (for name, email, etc. updates)
      firstName: studentData.firstName,
      lastName: studentData.lastName,
      email: studentData.email,
      phone: studentData.phone,
      address: studentData.address,
      dateOfBirth: studentData.dateOfBirth,
      gender: studentData.gender,
      
      // Student fields
      studentId: studentData.studentId,
      admissionDate: studentData.admissionDate,
      classId: studentData.classId,
      parentName: studentData.parentName,
      parentPhone: studentData.parentPhone,
      parentEmail: studentData.parentEmail,
      emergencyContact: studentData.emergencyContact,
      medicalInfo: studentData.medicalInfo,
      transportRoute: studentData.transportRoute
    };
    
    const response = await api.put(`/students/${id}`, studentPayload);
    return response.data;
  },

  // Delete student
  deleteStudent: async (id) => {
    const response = await api.delete(`/students/${id}`);
    return response.data;
  },

  // Get student grades
  getStudentGrades: async (id) => {
    const response = await api.get(`/students/${id}/grades`);
    return response.data;
  },

  // Get student attendance
  getStudentAttendance: async (id) => {
    const response = await api.get(`/students/${id}/attendance`);
    return response.data;
  },

  // Get student fees
  getStudentFees: async (id) => {
    const response = await api.get(`/students/${id}/fees`);
    return response.data;
  },

  // Get student statistics
  getStudentStats: async (id) => {
    const response = await api.get(`/students/${id}/stats`);
    return response.data;
  }
};

export default studentService;
