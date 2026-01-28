'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Loading } from '@/components/ui';

export default function AdminDashboardPage() {
  const { showToast } = useAppStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await adminApi.getStats();
      console.log('Admin stats response:', res);
      setStats(res.data || res);
    } catch (error: any) {
      console.error('Load stats error:', error);
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
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
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">数据概览</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">用户总数</div>
          <div className="text-3xl font-bold">{stats?.users?.total || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">设备总数</div>
          <div className="text-3xl font-bold">{stats?.equipment?.total || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">待审核</div>
          <div className="text-3xl font-bold text-yellow-600">{stats?.equipment?.pending || 0}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">订单金额</div>
          <div className="text-3xl font-bold text-green-600">¥{stats?.orders?.amount || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-bold mb-4">快捷入口</h2>
          <div className="space-y-2">
            <a href="/admin/equipment" className="block p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <span>设备管理</span>
                <span className="text-blue-600 font-bold">{stats?.equipment?.total || 0}</span>
              </div>
            </a>
            <a href="/admin/audit" className="block p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <span>待审核设备</span>
                <span className="text-yellow-600 font-bold">{stats?.equipment?.pending || 0}</span>
              </div>
            </a>
            <a href="/admin/users" className="block p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              <div className="flex items-center justify-between">
                <span>用户管理</span>
                <span className="text-blue-600 font-bold">{stats?.users?.total || 0}</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
