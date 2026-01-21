import apiClient from '../client';

export const notificationApi = {
  getList: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get('/notifications', { params }),

  markRead: (id: string) =>
    apiClient.put(`/notifications/${id}/read`),

  markAllRead: () =>
    apiClient.put('/notifications/read-all'),

  getUnreadCount: () =>
    apiClient.get('/notifications/unread-count')
};
