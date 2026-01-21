'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const USER_LEVEL_MAP: Record<number, string> = {
  0: '新用户',
  1: '普通用户',
  2: '优质用户',
  3: '认证用户',
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token') || localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      console.log('Profile data:', data);
      if (data.code === 0) {
        setUser(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    window.dispatchEvent(new Event('auth-change'));
    router.push('/');
  };

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="text-center text-gray-500">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8 md:py-12 max-w-md">
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">未登录</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>请先登录后查看个人信息</p>
          <div className="flex gap-3">
            <Link href="/auth/login" className="btn btn-primary flex-1">
              登录
            </Link>
            <Link href="/auth/register" className="btn flex-1" style={{ backgroundColor: 'var(--bg-hover)' }}>
              注册
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-6 max-w-4xl">
      {/* 用户信息卡片 */}
      <div className="card mb-4">
        <div className="flex items-center mb-4 md:mb-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-200 flex items-center justify-center text-2xl md:text-3xl">
            👤
          </div>
          <div className="ml-3 md:ml-4 flex-1">
            <h2 className="text-lg md:text-xl font-bold mb-1">{user.nickname || '未设置昵称'}</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {USER_LEVEL_MAP[user.userLevel || 0]}
            </p>
            <p className="text-xs md:text-sm" style={{ color: 'var(--text-tertiary)' }}>
              {user.phone}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-4 py-4 border-t border-b" style={{ borderColor: 'var(--border-divider)' }}>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold">{user.publishCount || 0}</div>
            <div className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>发布数</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold">{user.passCount || 0}</div>
            <div className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>通过数</div>
          </div>
          <div className="text-center">
            <div className="text-xl md:text-2xl font-bold" style={{ color: 'var(--color-error)' }}>
              ¥{user.balance || 0}
            </div>
            <div className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>余额</div>
          </div>
        </div>

        <Link href="/recharge" className="btn btn-primary w-full mt-4">
          充值
        </Link>
      </div>

      {/* 我的服务 */}
      <div className="card mb-4">
        <h3 className="font-bold mb-3 md:mb-4 text-base md:text-lg">我的服务</h3>
        <div className="space-y-0">
          <Link
            href="/profile/equipment"
            className="flex justify-between items-center py-3 md:py-4 border-b"
            style={{ borderColor: 'var(--border-divider)' }}
          >
            <span className="text-sm md:text-base">🚜 我的设备</span>
            <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          </Link>

          <Link
            href="/orders"
            className="flex justify-between items-center py-3 md:py-4 border-b"
            style={{ borderColor: 'var(--border-divider)' }}
          >
            <span className="text-sm md:text-base">📦 我的订单</span>
            <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          </Link>

          <Link
            href="/favorites"
            className="flex justify-between items-center py-3 md:py-4 border-b"
            style={{ borderColor: 'var(--border-divider)' }}
          >
            <span className="text-sm md:text-base">⭐ 我的收藏</span>
            <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          </Link>

          <Link
            href="/notifications"
            className="flex justify-between items-center py-3 md:py-4 border-b"
            style={{ borderColor: 'var(--border-divider)' }}
          >
            <span className="text-sm md:text-base">🔔 消息通知</span>
            <span style={{ color: 'var(--text-tertiary)' }}>→</span>
          </Link>

          {user.userLevel >= 9 && (
            <Link
              href="/admin"
              className="flex justify-between items-center py-3 md:py-4"
              style={{ borderColor: 'var(--border-divider)' }}
            >
              <span className="text-sm md:text-base">⚙️ 后台管理</span>
              <span style={{ color: 'var(--text-tertiary)' }}>→</span>
            </Link>
          )}
        </div>
      </div>

      {/* 退出登录 */}
      <button
        onClick={logout}
        className="btn w-full"
        style={{ backgroundColor: 'var(--color-error)', color: 'white' }}
      >
        退出登录
      </button>
    </div>
  );
}
