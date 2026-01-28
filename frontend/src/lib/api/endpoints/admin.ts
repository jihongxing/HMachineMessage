import apiClient from '../client';

export const adminApi = {
  // 设备审核
  auditEquipment: (id: string, data: { action: 'approve' | 'reject'; reason?: string }) =>
    apiClient.put(`/admin/equipment/${id}/audit`, data),

  getPendingList: (params?: { riskLevel?: string; page?: number; pageSize?: number }) =>
    apiClient.get('/admin/equipment/pending', { params }),

  // 设备管理
  getEquipmentList: (params?: { status?: number; keyword?: string; page?: number; pageSize?: number }) =>
    apiClient.get('/admin/equipment', { params }),

  updateEquipmentStatus: (id: string, status: number) =>
    apiClient.put(`/admin/equipment/${id}/status`, { status }),

  batchUpdateEquipmentStatus: (ids: string[], status: number) =>
    apiClient.put('/admin/equipment/batch/status', { ids, status }),

  // 分类管理
  createCategory: (data: { parentId?: number; name: string; slug: string; description?: string; icon?: string; sort?: number }) =>
    apiClient.post('/category', data),

  updateCategory: (id: number, data: { name?: string; slug?: string; description?: string; icon?: string; sort?: number; isActive?: boolean }) =>
    apiClient.put(`/category/${id}`, data),

  deleteCategory: (id: number) =>
    apiClient.delete(`/category/${id}`),

  // 用户管理
  getUserList: (params?: { keyword?: string; userLevel?: number; status?: number; page?: number; pageSize?: number }) =>
    apiClient.get('/admin/users', { params }),

  updateUserStatus: (id: string, data: { status: number; reason?: string; duration?: number }) =>
    apiClient.put(`/admin/users/${id}/status`, data),

  // 数据统计
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/admin/stats', { params }),

  // 举报管理
  getReportList: (params?: { status?: string; page?: number; pageSize?: number }) =>
    apiClient.get('/admin/reports', { params }),

  handleReport: (id: string, data: { result: string; note?: string }) =>
    apiClient.post(`/admin/reports/${id}/handle`, data)
};
