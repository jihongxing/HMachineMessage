'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }
    if (!password) {
      alert('请输入密码');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('access_token', data.data.token);
        window.dispatchEvent(new Event('auth-change'));
        alert('登录成功');
        router.push('/');
      } else {
        alert(data.message || '登录失败');
      }
    } catch (error) {
      alert('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div 
        className="w-full max-w-md"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-card)',
          padding: '2rem',
        }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">欢迎登录</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            重型机械信息中介平台
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="input"
              maxLength={11}
              style={{
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="input"
              maxLength={20}
              style={{
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn btn-primary w-full"
            style={{
              opacity: loading ? 0.7 : 1,
              borderRadius: '8px',
              height: '48px',
              fontSize: '16px',
              fontWeight: '600',
              marginTop: '2rem',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <div className="text-center text-sm pt-4" style={{ borderTop: '1px solid var(--border-divider)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>还没有账号？</span>
            <Link 
              href="/auth/register" 
              style={{ 
                color: 'var(--color-primary)',
                fontWeight: '500',
                marginLeft: '0.5rem',
              }}
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
