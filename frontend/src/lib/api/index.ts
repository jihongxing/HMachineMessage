// 导入拦截器以确保其被执行
import './interceptors';

export { authApi } from './endpoints/auth';
export { userApi } from './endpoints/user';
export { equipmentApi } from './endpoints/equipment';
export { categoryApi } from './endpoints/category';
export { regionApi } from './endpoints/region';
export { uploadApi } from './endpoints/upload';
export { orderApi } from './endpoints/order';
export { favoriteApi } from './endpoints/favorite';
export { reviewApi } from './endpoints/review';
export { notificationApi } from './endpoints/notification';
export { rechargeApi } from './endpoints/recharge';
export { adminApi } from './endpoints/admin';
export { default as apiClient } from './client';
