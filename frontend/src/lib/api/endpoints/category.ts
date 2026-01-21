import apiClient from '../client';
import '../interceptors';

export const categoryApi = {
  // 获取分类树
  getTree: () => 
    apiClient.get('/categories/tree'),
};
