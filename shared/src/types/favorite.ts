export interface Favorite {
  id: string;
  equipmentId: string;
  userId: string;
  createdAt: string;
  equipment?: {
    id: string;
    model: string;
    images: string[];
    price: number;
    priceUnit: string;
    city: string;
    county: string;
    rankLevel: number;
    rating: number;
    ratingCount: number;
    status: number;
  };
}
