'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import { Tabs, Empty, Loading, Pagination, Badge } from '@/components/ui';
import { getRankLevelText, getRankRegionText } from '@/lib/utils/payment';
import { formatDate } from '@/lib/utils/format';
import Image from 'next/image';

export default function OrdersPage() {
  const router = useRouter();
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
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
    
    loadOrders();
  }, [mounted, status, page, isLoggedIn]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const statusMap: Record<string, number | undefined> = {
        all: undefined,
        pending: 0,
        paid: 1,
        refunded: 2,
        cancelled: 3
      };
      
      const res = await orderApi.getList({
        status: statusMap[status]?.toString(),
        page,
        pageSize: 20
      });
      
      setOrders(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待支付' },
    { key: 'paid', label: '已支付' },
    { key: 'refunded', label: '已退款' },
    { key: 'cancelled', label: '已取消' }
  ];

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

  return (
    <div className="container px-3 py-4 md:px-4 md:py-6">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">我的订单</h1>

      {/* Tabs - 移动端横向滚动 */}
      <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
        <Tabs tabs={tabs} activeKey={status} onChange={setStatus} />
      </div>

      <div className="mt-4 md:mt-6">
        {orders.length === 0 ? (
          <Empty
            icon="📦"
            title="暂无订单"
            description="您还没有创建任何订单"
          />
        ) : (
          <>
            <div className="space-y-3 md:space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card p-3 md:p-4">
                  {/* 移动端：垂直布局优化 */}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    {/* 图片 - 移动端更大展示 */}
                    <div className="relative w-full sm:w-20 md:w-24 h-32 sm:h-20 md:h-24 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0">
                      {order.equipment?.images?.[0] && (
                        <Image
                          src={order.equipment.images[0]}
                          alt={order.equipment.model}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* 标题和状态 */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-sm md:text-base truncate">{order.equipment?.model}</h3>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      {/* 订单信息 */}
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-1 truncate">
                        订单号：{order.orderNo}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {getRankLevelText(order.rankLevel)} · {order.duration}个月
                      </p>
                      
                      {/* 价格和操作按钮 */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-base md:text-lg font-bold text-red-600">
                          ¥{order.amount}
                        </span>
                        <div className="flex gap-2">
                          {order.status === 0 && (
                            <button
                              onClick={() => router.push(`/orders/${order.id}/pay`)}
                              className="btn btn-sm btn-primary flex-1 sm:flex-none text-xs md:text-sm"
                            >
                              去支付
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/orders/${order.id}`)}
                            className="btn btn-sm flex-1 sm:flex-none text-xs md:text-sm"
                          >
                            查看详情
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              current={page}
              total={total}
              pageSize={20}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
