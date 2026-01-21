import apiClient from '../client';

export const rechargeApi = {
  create: (data: { amount: number; payMethod: string }) =>
    apiClient.post('/recharge', data),

  getHistory: (params?: { page?: number; pageSize?: number }) =>
    apiClient.get('/recharge/history', { params })
};
