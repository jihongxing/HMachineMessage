'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { orderApi, userApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import PaymentSelector from '@/components/payment/PaymentSelector';
import { Loading } from '@/components/ui';
import { getRankLevelText, getRankRegionText } from '@/lib/utils/payment';

export default function PayOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  
  const { showToast } = useAppStore();
  const { isLoggedIn, user } = useUserStore();
  
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [payMethod, setPayMethod] = useState('wechat');
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
      const data = res.data;
      
      if (data.status !== 0) {
        showToast({ type: 'info', message: '订单已支付或已取消' });
        router.push('/orders');
        return;
      }
      setOrder(data);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
      router.push('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    setPaying(true);
    try {
      const data = await orderApi.pay(orderId, { payMethod });
      
      if (payMethod === 'balance') {
        showToast({ type: 'success', message: '支付成功' });
        router.push('/orders');
      } else {
        showToast({ type: 'info', message: '请使用手机扫码支付' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setPaying(false);
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
    <div className="container py-4 md:py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">支付订单</h1>

      {/* 订单信息 */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">订单信息</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">订单号</span>
            <span className="font-mono">{order?.orderNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">推广档位</span>
            <span>{getRankLevelText(order?.rankLevel)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">推广区域</span>
            <span>{getRankRegionText(order?.rankRegion)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">推广时长</span>
            <span>{order?.duration}个月</span>
          </div>
          <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
            <span>应付金额</span>
            <span className="text-red-600">¥{order?.amount}</span>
          </div>
        </div>
      </div>

      {/* 支付方式 */}
      <div className="card mb-6">
        <h2 className="font-bold mb-4">支付方式</h2>
        <PaymentSelector
          value={payMethod}
          onChange={setPayMethod}
          balance={user?.balance || 0}
          amount={order?.amount || 0}
        />
      </div>

      {/* 支付按钮 */}
      <div className="flex gap-3">
        <button onClick={() => router.back()} className="btn flex-1">
          取消
        </button>
        <button
          onClick={handlePay}
          disabled={paying || (payMethod === 'balance' && (user?.balance || 0) < order?.amount)}
          className="btn btn-primary flex-1"
        >
          {paying ? '支付中...' : `确认支付 ¥${order?.amount}`}
        </button>
      </div>
    </div>
  );
}
