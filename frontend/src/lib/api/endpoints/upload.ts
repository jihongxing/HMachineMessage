import apiClient from '../client';
import '../interceptors';

export const uploadApi = {
  // 上传文件
  upload: async (file: File, onProgress?: (percent: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });
    
    // 响应拦截器返回response.data，后端返回{code, data: {url, ...}, message}
    // 所以这里访问response.data.url
    return response.data.url;
  },
  
  // 删除文件
  delete: (key: string) => 
    apiClient.delete(`/upload/${key}`),
};
