'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { showToast } = useAppStore();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast({ type: 'error', message: '请输入正确的手机号' });
      return;
    }

    try {
      await authApi.sendSms(phone, 'reset');
      showToast({ type: 'success', message: '验证码已发送' });
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
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showToast({ type: 'error', message: '请输入正确的手机号' });
      return;
    }

    if (!code || code.length !== 6) {
      showToast({ type: 'error', message: '请输入6位验证码' });
      return;
    }

    if (newPassword.length < 6 || newPassword.length > 20) {
      showToast({ type: 'error', message: '密码长度6-20位' });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: '两次密码不一致' });
      return;
    }

    setSubmitting(true);
    try {
      await authApi.resetPassword({ phone, code, newPassword });
      showToast({ type: 'success', message: '密码重置成功' });
      router.push('/auth/login');
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ backgroundColor: 'var(--bg-page)' }}>
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">找回密码</h1>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              maxLength={11}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">验证码</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入验证码"
                maxLength={6}
                className="flex-1 px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
              >
                {countdown > 0 ? `${countdown}s` : '获取验证码'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（6-20位）"
              maxLength={20}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">确认密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              maxLength={20}
              className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? '提交中...' : '重置密码'}
          </button>

          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              返回登录
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
