import apiClient from '../client';
import '../interceptors';

export interface LoginDto {
  phone: string;
  password?: string;
  code?: string;
  type: 'password' | 'sms';
}

export interface RegisterDto {
  phone: string;
  code: string;
  password: string;
  nickname: string;
}

export const authApi = {
  // 发送验证码
  sendSms: (phone: string, type: 'register' | 'login' | 'reset' = 'register') => 
    apiClient.post('/auth/sms/send', { phone, type }),
  
  // 登录
  login: (data: LoginDto) => 
    apiClient.post('/auth/login', data),
  
  // 注册
  register: (data: RegisterDto) => 
    apiClient.post('/auth/register', data),
  
  // 重置密码
  resetPassword: (data: { phone: string; code: string; newPassword: string }) => 
    apiClient.post('/auth/password/reset', data),
};
