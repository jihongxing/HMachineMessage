// 用户等级
export enum UserLevel {
  NEW = 0,
  NORMAL = 1,
  QUALITY = 2,
  CERTIFIED = 3,
}

// 用户状态
export enum UserStatus {
  NORMAL = 0,
  BANNED = 1,
}

// 设备状态
export enum EquipmentStatus {
  PENDING = 0,
  PUBLISHED = 1,
  REJECTED = 2,
  OFFLINE = 3,
  DELETED = 4,
}

// 排名档位
export enum RankLevel {
  BASIC = 0,
  RECOMMENDED = 1,
  TOP = 2,
}

// API响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data?: T
}

export * from './api';
export * from './equipment';
export * from './user';
export * from './favorite';
export * from './review';
export * from './order';
export * from './notification';
export * from './recharge';
