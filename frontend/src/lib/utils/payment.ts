export const RANK_PRICES = {
  recommend: {
    province: 500,
    city: 200,
    county: 100
  },
  top: {
    province: 800,
    city: 300,
    county: 150
  }
};

export function calculatePrice(
  rankLevel: 'recommend' | 'top',
  rankRegion: 'province' | 'city' | 'county',
  duration: number
): number {
  const basePrice = RANK_PRICES[rankLevel][rankRegion];
  return basePrice * duration;
}

export function getRankLevelText(level: string): string {
  const map: Record<string, string> = {
    recommend: '推荐位',
    top: '置顶位'
  };
  return map[level] || level;
}

export function getRankRegionText(region: string): string {
  const map: Record<string, string> = {
    province: '省级推广',
    city: '市级推广',
    county: '区县推广'
  };
  return map[region] || region;
}

export function getOrderStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待支付',
    paid: '已支付',
    refunded: '已退款',
    cancelled: '已取消'
  };
  return map[status] || status;
}
