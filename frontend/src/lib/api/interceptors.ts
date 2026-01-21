import apiClient from './client';

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 添加Token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    // 统一返回data
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，清除登录状态
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        window.location.href = '/auth/login';
      }
    }
    
    // 返回错误信息
    const message = error.response?.data?.message || error.message || '请求失败';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
