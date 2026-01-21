import apiClient from '../client';

export const orderApi = {
  create: (data: {
    equipmentId: string;
    rankLevel: number;
    rankRegion: string;
    duration: number;
  }) => apiClient.post('/orders', data),

  pay: (orderId: string, data: { payMethod: string }) =>
    apiClient.post(`/orders/${orderId}/pay`, data),

  getList: (params?: {
    status?: string;
    page?: number;
    pageSize?: number;
  }) => apiClient.get('/orders', { params }),

  getDetail: (orderId: string) =>
    apiClient.get(`/orders/${orderId}`),

  refund: (orderId: string, reason: string) =>
    apiClient.post(`/orders/${orderId}/refund`, { reason }),

  cancel: (orderId: string) =>
    apiClient.post(`/orders/${orderId}/cancel`)
};
