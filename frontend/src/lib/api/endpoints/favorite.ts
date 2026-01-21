import apiClient from '../client';

export const favoriteApi = {
  add: (equipmentId: string) =>
    apiClient.post('/favorites', { equipmentId }),

  remove: (equipmentId: string) =>
    apiClient.delete(`/favorites/${equipmentId}`),

  getList: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get('/favorites', { params }),

  check: (equipmentId: string) =>
    apiClient.get(`/favorites/check/${equipmentId}`)
};
