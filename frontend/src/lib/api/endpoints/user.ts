import apiClient from '../client';
import '../interceptors';

export const userApi = {
  // 获取个人信息
  getProfile: () => 
    apiClient.get('/user/profile'),
  
  // 更新个人信息
  updateProfile: (data: { nickname?: string; avatar?: string }) => 
    apiClient.put('/user/profile', data),
  
  // 修改密码
  changePassword: (data: { oldPassword: string; newPassword: string }) => 
    apiClient.put('/user/password', data),
  
  // 实名认证
  verifyRealName: (data: { realName: string; idCard: string; idCardFront?: string; idCardBack?: string }) => 
    apiClient.post('/user/verify/realname', data),
  
  // 企业认证
  verifyCompany: (data: { companyName: string; businessLicense: string; legalPerson: string; licenseImage: string }) => 
    apiClient.post('/user/verify/company', data),
};
