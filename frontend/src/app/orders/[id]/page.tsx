'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { orderApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import { Loading, Badge } from '@/components/ui';
import { getRankLevelText, getRankRegionText } from '@/lib/utils/payment';
import { formatDate } from '@/lib/utils/format';
import Image from 'next/image';

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

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
    
    if (!orderId || orderId === 'undefined') {
      showToast({ type: 'error', message: '订单ID无效' });
      router.push('/orders');
      return;
    }
    
    loadOrder();
  }, [mounted, orderId, isLoggedIn]);

  const loadOrder = async () => {
    try {
      const res = await orderApi.getDetail(orderId);
      setOrder(res.data);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const map: Record<number, any> = {
      0: { variant: 'warning', text: '待支付' },
      1: { variant: 'success', text: '已支付' },
      2: { variant: 'info', text: '已退款' },
      3: { variant: 'default', text: '已取消' }
    };
    const config = map[status] || { variant: 'default', text: '未知' };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <Loading size="lg" />
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="container py-4 md:py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">订单详情</h1>

      {/* 订单状态 */}
      <div className="card mb-4">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 dark:text-gray-400">订单状态</span>
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* 设备信息 */}
      <div className="card mb-4">
        <h2 className="font-bold mb-4">设备信息</h2>
        <div className="flex gap-4">
          <div className="relative w-24 h-24 bg-gray-200 rounded flex-shrink-0">
            {order.equipment?.images?.[0] && (
              <Image
                src={order.equipment.images[0]}
                alt={order.equipment.model}
                fill
                className="object-cover rounded"
              />
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold mb-2">{order.equipment?.model}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              {order.equipment?.category1} · {order.equipment?.category2}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {order.equipment?.province} {order.equipment?.city}
            </p>
          </div>
        </div>
      </div>

      {/* 订单信息 */}
      <div className="card mb-4">
        <h2 className="font-bold mb-4">订单信息</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">订单号</span>
            <span className="font-mono">{order.orderNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">推广档位</span>
            <span>{getRankLevelText(order.rankLevel)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">推广区域</span>
            <span>{getRankRegionText(order.rankRegion)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">推广时长</span>
            <span>{order.duration}个月</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">创建时间</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
          {order.paidAt && (
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">支付时间</span>
              <span>{formatDate(order.paidAt)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 费用信息 */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">费用信息</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">订单金额</span>
            <span>¥{order.amount}</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
            <span>实付金额</span>
            <span className="text-red-600">¥{order.payAmount}</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button onClick={() => router.back()} className="btn flex-1">
          返回
        </button>
        {order.status === 0 && (
          <button
            onClick={() => router.push(`/orders/${order.id}/pay`)}
            className="btn btn-primary flex-1"
          >
            去支付
          </button>
        )}
      </div>
    </div>
  );
}
