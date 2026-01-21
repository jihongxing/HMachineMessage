import apiClient from '../client';
import '../interceptors';

export const regionApi = {
  // 获取省份列表
  getProvinces: () => 
    apiClient.get('/regions/provinces'),
  
  // 获取城市列表
  getCities: (provinceId: number) => 
    apiClient.get(`/regions/cities/${provinceId}`),
  
  // 获取区县列表
  getCounties: (cityId: number) => 
    apiClient.get(`/regions/counties/${cityId}`),
};
