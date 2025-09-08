import api from './api';

const eventService = {
  // Get all events
  getEvents: async (params = {}) => {
    const response = await api.get('/events', { params });
    return response.data;
  },

  // Get single event
  getEvent: async (id) => {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },

  // Create new event
  createEvent: async (eventData) => {
    const response = await api.post('/events', eventData);
    return response.data;
  },

  // Update event
  updateEvent: async (id, eventData) => {
    const response = await api.put(`/events/${id}`, eventData);
    return response.data;
  },

  // Delete event
  deleteEvent: async (id) => {
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },

  // Get events by date range
  getEventsByDateRange: async (startDate, endDate) => {
    const response = await api.get('/events', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Get events by type
  getEventsByType: async (eventType) => {
    const response = await api.get('/events', {
      params: { eventType }
    });
    return response.data;
  }
};

export default eventService;
