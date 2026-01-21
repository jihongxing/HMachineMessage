export enum RechargeStatus {
  PENDING = 0,
  PAID = 1,
  CANCELLED = 2,
}

export interface Recharge {
  id: string;
  userId: string;
  orderNo: string;
  amount: number;
  bonusAmount: number;
  payMethod: string;
  status: RechargeStatus;
  paidAt: string | null;
  createdAt: string;
}
