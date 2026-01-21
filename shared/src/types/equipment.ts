export enum EquipmentStatus {
  PENDING = 0,
  PUBLISHED = 1,
  REJECTED = 2,
  OFFLINE = 3,
  DELETED = 4,
}

export enum RankLevel {
  BASIC = 0,
  RECOMMEND = 1,
  TOP = 2,
}

export enum PriceUnit {
  DAY = 'day',
  HOUR = 'hour',
}

export interface Equipment {
  id: string;
  userId: string;
  category1: string;
  category2: string;
  model: string;
  province: string;
  city: string;
  county: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  price: number;
  priceUnit: PriceUnit;
  phone: string;
  wechat: string | null;
  images: string[];
  description: string | null;
  capacity: string | null;
  availableStart: string | null;
  availableEnd: string | null;
  status: EquipmentStatus;
  rejectReason: string | null;
  rankLevel: RankLevel;
  rankExpire: string | null;
  rankRegion: string | null;
  viewCount: number;
  contactCount: number;
  favoriteCount: number;
  scanCount: number;
  rating: number;
  ratingCount: number;
  qrcodeUrl: string | null;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface EquipmentListItem extends Omit<Equipment, 'description' | 'capacity' | 'availableStart' | 'availableEnd'> {
  user?: {
    id: string;
    nickname: string;
    avatar: string | null;
    userLevel: number;
  };
}

export interface EquipmentDetail extends Equipment {
  user: {
    id: string;
    nickname: string;
    avatar: string | null;
    userLevel: number;
  };
}
