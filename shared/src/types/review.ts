export enum ReviewStatus {
  PENDING = 0,
  PUBLISHED = 1,
  REJECTED = 2,
}

export interface Review {
  id: string;
  equipmentId: string;
  userId: string;
  rating: number;
  content: string;
  images: string[] | null;
  tags: string[] | null;
  status: ReviewStatus;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nickname: string;
    avatar: string | null;
    userLevel: number;
  };
}
