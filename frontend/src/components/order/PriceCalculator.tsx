'use client';

import { calculatePrice } from '@/lib/utils/payment';

interface PriceCalculatorProps {
  rankLevel: 'recommend' | 'top';
  rankRegion: 'province' | 'city' | 'county';
  duration: number;
}

export default function PriceCalculator({ rankLevel, rankRegion, duration }: PriceCalculatorProps) {
  const unitPrice = calculatePrice(rankLevel, rankRegion, 1);
  const totalPrice = calculatePrice(rankLevel, rankRegion, duration);

  return (
    <div className="card bg-gray-50 dark:bg-gray-800">
      <h3 className="font-bold mb-4">价格明细</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">单价</span>
          <span>¥{unitPrice}/月</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">时长</span>
          <span>{duration}个月</span>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
          <span>应付金额</span>
          <span className="text-red-600">¥{totalPrice}</span>
        </div>
      </div>
    </div>
  );
}
