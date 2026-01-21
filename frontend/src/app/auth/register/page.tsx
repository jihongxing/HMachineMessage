'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sms/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, type: 'register' }),
      });
      const data = await res.json();
      if (data.code === 0) {
        alert('验证码已发送');
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        alert(data.message || '发送失败');
      }
    } catch (error) {
      alert('发送失败');
    }
  };

  const handleRegister = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      alert('请输入正确的手机号');
      return;
    }
    if (!code) {
      alert('请输入验证码');
      return;
    }
    if (!password) {
      alert('请设置密码');
      return;
    }
    if (password.length < 6 || password.length > 20) {
      alert('密码长度必须在6-20位之间');
      return;
    }
    if (password !== confirmPassword) {
      alert('两次密码输入不一致');
      return;
    }
    if (!nickname) {
      alert('请输入昵称');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, password, nickname }),
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('access_token', data.data.token);
        window.dispatchEvent(new Event('auth-change'));
        alert('注册成功');
        router.push('/');
      } else {
        alert(data.message || '注册失败');
      }
    } catch (error) {
      alert('注册失败');
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">欢迎注册</h1>
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
            <label className="block text-sm font-medium mb-2">验证码</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入验证码"
                className="input flex-1"
                maxLength={6}
                style={{
                  borderRadius: '8px',
                  fontSize: '16px',
                }}
              />
              <button
                onClick={sendCode}
                disabled={countdown > 0}
                className="btn"
                style={{
                  backgroundColor: countdown > 0 ? 'var(--bg-disabled)' : 'var(--color-primary)',
                  color: countdown > 0 ? 'var(--text-disabled)' : 'white',
                  minWidth: '110px',
                  borderRadius: '8px',
                  fontWeight: '500',
                }}
              >
                {countdown > 0 ? `${countdown}秒` : '获取验证码'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">设置密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请设置密码（6-20位）"
              className="input"
              maxLength={20}
              style={{
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入密码"
              className="input"
              maxLength={20}
              style={{
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="input"
              maxLength={20}
              style={{
                borderRadius: '8px',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            onClick={handleRegister}
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
            {loading ? '注册中...' : '注册'}
          </button>

          <div className="text-center text-sm pt-4" style={{ borderTop: '1px solid var(--border-divider)' }}>
            <span style={{ color: 'var(--text-secondary)' }}>已有账号？</span>
            <Link 
              href="/auth/login" 
              style={{ 
                color: 'var(--color-primary)',
                fontWeight: '500',
                marginLeft: '0.5rem',
              }}
            >
              立即登录
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
