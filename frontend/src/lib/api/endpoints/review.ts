import apiClient from '../client';

export const reviewApi = {
  create: (data: {
    equipmentId: string;
    rating: number;
    content: string;
  }) => apiClient.post('/reviews', data),

  getList: (params: {
    equipmentId?: string;
    page?: number;
    pageSize?: number;
  }) => apiClient.get('/reviews', { params })
};
