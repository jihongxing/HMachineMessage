import apiClient from '../client';
import '../interceptors';
import { PriceUnitType } from '../../utils/priceUnit';

export interface EquipmentFormData {
  model: string;
  category1: string;
  category2: string;
  images: string[];
  description?: string;
  capacity?: string;
  provinceId: number;
  cityId: number;
  countyId: number;
  address: string;
  latitude?: number;
  longitude?: number;
  price: number;
  priceUnit: PriceUnitType;
  phone: string;
  wechat?: string;
  availableStart?: string;
  availableEnd?: string;
}

export const equipmentApi = {
  // 创建设备
  create: (data: EquipmentFormData) => 
    apiClient.post('/equipment', data),
  
  // 更新设备
  update: (id: string, data: EquipmentFormData) => 
    apiClient.put(`/equipment/${id}`, data),
  
  // 删除设备
  delete: (id: string) => 
    apiClient.delete(`/equipment/${id}`),
  
  // 上架/下架
  updateStatus: (id: string, action: 'online' | 'offline') => 
    apiClient.put(`/equipment/${id}/status`, { action }),
  
  // 获取设备详情
  getDetail: (id: string, params?: { latitude?: number; longitude?: number }) => 
    apiClient.get(`/equipment/${id}`, { params }),
  
  // 设备列表
  getList: (params: {
    category1?: string;
    category2?: string;
    provinceId?: number;
    cityId?: number;
    countyId?: number;
    keyword?: string;
    priceMin?: number;
    priceMax?: number;
    rankLevel?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
    latitude?: number;
    longitude?: number;
  }) => 
    apiClient.get('/equipment', { params }),
  
  // 我的设备列表
  myList: (params: { status?: number; page?: number; pageSize?: number }) => 
    apiClient.get('/equipment/my', { params }),
  
  // 查看联系方式
  viewContact: (id: string, type: 'phone' | 'wechat') => 
    apiClient.post(`/equipment/${id}/contact`, { type }),
};
