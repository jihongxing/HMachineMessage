export enum UserLevel {
  NEW = 0,
  NORMAL = 1,
  PREMIUM = 2,
  VERIFIED = 3,
}

export enum UserStatus {
  ACTIVE = 0,
  BANNED = 1,
}

export interface User {
  id: string;
  phone: string;
  nickname: string;
  avatar: string | null;
  userLevel: UserLevel;
  realName: string | null;
  companyName: string | null;
  balance: number;
  publishCount: number;
  passCount: number;
  violationCount: number;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  lastLogin: string | null;
}
