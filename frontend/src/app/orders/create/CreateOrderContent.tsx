'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { equipmentApi, orderApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import RankSelector from '@/components/order/RankSelector';
import RegionSelector from '@/components/order/RegionSelector';
import DurationSelector from '@/components/order/DurationSelector';
import PriceCalculator from '@/components/order/PriceCalculator';
import { Loading } from '@/components/ui';
import Image from 'next/image';

export default function CreateOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const equipmentId = searchParams.get('equipmentId');
  
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();
  
  const [equipment, setEquipment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [rankLevel, setRankLevel] = useState<'recommend' | 'top'>('recommend');
  const [rankRegion, setRankRegion] = useState<'province' | 'city' | 'county'>('city');
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const hasToken = typeof window !== 'undefined' && 
      (localStorage.getItem('access_token') || localStorage.getItem('token'));
    
    if (!hasToken && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    
    if (!equipmentId) {
      showToast({ type: 'error', message: '缺少设备ID' });
      router.back();
      return;
    }
    
    loadEquipment();
  }, [mounted, equipmentId, isLoggedIn]);

  const loadEquipment = async () => {
    try {
      const response = await equipmentApi.getDetail(equipmentId!);
      setEquipment(response.data);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // 后端统一计算价格，前端只传参数
      const response = await orderApi.create({
        equipmentId: equipmentId!,
        rankLevel: rankLevel === 'recommend' ? 1 : 2,
        rankRegion,
        duration
      });
      
      const orderId = response.data?.orderId || (response as any).orderId;
      
      if (!orderId) {
        throw new Error('订单ID获取失败');
      }
      
      showToast({ type: 'success', message: '订单创建成功' });
      router.push(`/orders/${orderId}/pay`);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">创建推广订单</h1>

      <div className="card mb-6">
        <h2 className="font-bold mb-4">推广设备</h2>
        <div className="flex gap-4">
          <div className="relative w-24 h-24 bg-gray-200 rounded flex-shrink-0">
            {equipment?.images?.[0] ? (
              <Image
                src={equipment.images[0]}
                alt={equipment.model}
                fill
                className="object-cover rounded"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                暂无图片
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold mb-1">{equipment?.model}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {equipment?.category1} / {equipment?.category2}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              📍 {equipment?.province} {equipment?.city} {equipment?.county}
            </p>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h2 className="font-bold mb-4">选择档位</h2>
        <RankSelector value={rankLevel} onChange={setRankLevel} />
      </div>

      <div className="card mb-6">
        <h2 className="font-bold mb-4">推广区域</h2>
        <RegionSelector
          value={rankRegion}
          onChange={setRankRegion}
          equipmentRegion={{
            province: equipment?.province,
            city: equipment?.city,
            county: equipment?.county
          }}
        />
      </div>

      <div className="card mb-6">
        <h2 className="font-bold mb-4">推广时长</h2>
        <DurationSelector value={duration} onChange={setDuration} />
      </div>

      <PriceCalculator
        rankLevel={rankLevel}
        rankRegion={rankRegion}
        duration={duration}
      />

      <div className="flex gap-3 mt-6">
        <button onClick={() => router.back()} className="btn flex-1">
          取消
        </button>
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn btn-primary flex-1"
        >
          {submitting ? '创建中...' : '创建订单'}
        </button>
      </div>
    </div>
  );
}
