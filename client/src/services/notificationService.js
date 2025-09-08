import api from './authService';

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getNotificationStats: () => api.get('/notifications/stats'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  createNotification: (data) => api.post('/notifications', data),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};
