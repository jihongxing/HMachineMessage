'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import FontSizeControl from './FontSizeControl';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 检查登录状态
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    checkAuth();

    // 监听storage变化
    window.addEventListener('storage', checkAuth);
    
    // 自定义事件监听登录状态变化
    window.addEventListener('auth-change', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('auth-change', checkAuth);
    };
  }, []);

  const navItems = [
    { href: '/', label: '首页', icon: '🏠' },
    { href: '/equipment', label: '设备', icon: '🚜' },
    { href: '/favorites', label: '收藏', icon: '⭐', desktopOnly: true },
    { href: '/orders', label: '订单', icon: '📦' },
    { href: '/profile', label: '我的', icon: '👤' },
  ];

  const mobileNavItems = navItems.filter(item => !item.desktopOnly);

  return (
    <>
      {/* 桌面端导航 */}
      <nav className="desktop-only fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            重型机械平台
          </Link>

          <div className="flex items-center gap-6">
            {navItems.slice(0, -1).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`hover:text-blue-600 transition ${
                  pathname === item.href ? 'text-blue-600 font-medium' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <FontSizeControl />
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <Link
                  href="/equipment/new"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                  免费发布
                </Link>
                <Link
                  href="/notifications"
                  className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  🔔
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  个人中心
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 移动端底部导航 */}
      <nav className="mobile-only fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-around h-14">
          {mobileNavItems.slice(0, 2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                pathname === item.href ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
          
          {/* 发布按钮 */}
          {isLoggedIn ? (
            <Link
              href="/equipment/new"
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <span className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl -mt-4 shadow-lg">
                +
              </span>
              <span className="text-xs text-blue-600 mt-0.5">发布</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="flex flex-col items-center justify-center flex-1 h-full text-gray-600 dark:text-gray-400"
            >
              <span className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-xl -mt-4">
                +
              </span>
              <span className="text-xs mt-0.5">发布</span>
            </Link>
          )}
          
          {mobileNavItems.slice(2).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                pathname === item.href ? 'text-blue-600' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* 占位符 */}
      <div className="desktop-only h-16" />
      <div className="mobile-only h-14" />
    </>
  );
}
