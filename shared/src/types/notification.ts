export enum NotificationType {
  AUDIT = 'audit',
  PAYMENT = 'payment',
  INTERACTION = 'interaction',
  SYSTEM = 'system',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  content: string;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface UnreadCount {
  total: number;
  audit: number;
  payment: number;
  interaction: number;
  system: number;
}
