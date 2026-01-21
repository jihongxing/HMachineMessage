export enum OrderStatus {
  PENDING = 0,
  PAID = 1,
  REFUNDED = 2,
  CANCELLED = 3,
}

export enum PayMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  BALANCE = 'balance',
}

export interface Order {
  id: string;
  orderNo: string;
  equipmentId: string;
  userId: string;
  rankLevel: number;
  rankRegion: string;
  duration: number;
  amount: number;
  payAmount: number;
  payMethod: string | null;
  status: OrderStatus;
  paidAt: string | null;
  refundAt: string | null;
  refundAmount: number | null;
  createdAt: string;
  updatedAt: string;
  equipment?: {
    id: string;
    model: string;
    images: string[];
  };
}
