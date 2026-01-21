'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import apiClient from '@/lib/api/client';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoggedIn, user, setUser } = useUserStore();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const loadUser = async () => {
      const hasToken = typeof window !== 'undefined' && 
        (localStorage.getItem('access_token') || localStorage.getItem('token'));

      if (!hasToken && !isLoggedIn) {
        router.push('/auth/login');
        return;
      }

      // 如果没有用户信息，加载用户信息
      if (!user && hasToken) {
        try {
          const res = await apiClient.get('/user/profile');
          const userData = res.data?.data || res.data;
          setUser(userData);
          
          if (userData.userLevel >= 9) {
            setIsAuthorized(true);
          } else {
            router.push('/');
          }
        } catch (error) {
          console.error('Load user error:', error);
          router.push('/auth/login');
        } finally {
          setLoading(false);
        }
      } else if (user) {
        if (user.userLevel >= 9) {
          setIsAuthorized(true);
        } else {
          router.push('/');
        }
        setLoading(false);
      }
    };

    loadUser();
  }, [mounted, isLoggedIn, user, router, setUser]);

  if (!mounted || loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* 侧边栏 */}
        <aside className="w-64 bg-white dark:bg-gray-800 min-h-screen border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h1 className="text-xl font-bold">后台管理</h1>
          </div>
          <nav className="px-4">
            <a href="/admin" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              📊 数据概览
            </a>
            <a href="/admin/audit" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              ✅ 设备审核
            </a>
            <a href="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              👥 用户管理
            </a>
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
