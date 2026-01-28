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
  const [menuOpen, setMenuOpen] = useState(false);

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

  const navItems = [
    { href: '/admin', icon: '📊', label: '数据概览' },
    { href: '/admin/equipment', icon: '🚜', label: '设备管理' },
    { href: '/admin/categories', icon: '📁', label: '分类管理' },
    { href: '/admin/audit', icon: '✅', label: '设备审核' },
    { href: '/admin/users', icon: '👥', label: '用户管理' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 移动端顶部导航 */}
      <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">后台管理</h1>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
        {menuOpen && (
          <nav className="px-4 pb-4 space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {item.icon} {item.label}
              </a>
            ))}
          </nav>
        )}
      </div>

      <div className="flex">
        {/* 桌面端侧边栏 */}
        <aside className="hidden md:block w-64 bg-white dark:bg-gray-800 min-h-screen border-r border-gray-200 dark:border-gray-700">
          <div className="p-6">
            <h1 className="text-xl font-bold">后台管理</h1>
          </div>
          <nav className="px-4">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {item.icon} {item.label}
              </a>
            ))}
          </nav>
        </aside>

        {/* 主内容区 */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
