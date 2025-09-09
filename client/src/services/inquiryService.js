import api from './api';

const inquiryService = {
  // Get all inquiries
  getInquiries: async (params = {}) => {
    console.log('🔍 InquiryService: Fetching inquiries with params:', params);
    console.log('🔍 InquiryService: API base URL:', api.defaults.baseURL);
    console.log('🔍 InquiryService: Auth token present:', !!localStorage.getItem('token'));
    
    try {
      const response = await api.get('/inquiries', { params });
      console.log('✅ InquiryService: Successfully fetched inquiries:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ InquiryService: Error fetching inquiries:', error);
      console.error('❌ InquiryService: Error response:', error.response?.data);
      throw error;
    }
  },

  // Get single inquiry
  getInquiry: async (id) => {
    const response = await api.get(`/inquiries/${id}`);
    return response.data;
  },

  // Get inquiry by inquiry ID
  getInquiryByInquiryId: async (inquiryId) => {
    const response = await api.get(`/inquiries/lookup/${inquiryId}`);
    return response.data;
  },

  // Create new inquiry
  createInquiry: async (inquiryData) => {
    const response = await api.post('/inquiries', inquiryData);
    return response.data;
  },

  // Update inquiry
  updateInquiry: async (id, inquiryData) => {
    const response = await api.put(`/inquiries/${id}`, inquiryData);
    return response.data;
  },

  // Delete inquiry
  deleteInquiry: async (id) => {
    const response = await api.delete(`/inquiries/${id}`);
    return response.data;
  },

  // Convert inquiry to student
  convertInquiryToStudent: async (id, studentData) => {
    const response = await api.post(`/inquiries/${id}/convert-to-student`, studentData);
    return response.data;
  },

  // Get inquiry statistics
  getInquiryStats: async () => {
    const response = await api.get('/inquiries/stats');
    return response.data;
  }
};

export default inquiryService;
