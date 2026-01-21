'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import { getPasswordStrength } from '@/lib/utils/validate';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { showToast } = useAppStore();
  const { logout } = useUserStore();
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const strength = getPasswordStrength(newPassword);
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500'
  };
  const strengthTexts = {
    weak: '弱',
    medium: '中',
    strong: '强'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!oldPassword) {
      showToast({ type: 'error', message: '请输入原密码' });
      return;
    }
    
    if (newPassword.length < 6 || newPassword.length > 20) {
      showToast({ type: 'error', message: '新密码长度为6-20个字符' });
      return;
    }
    
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/.test(newPassword)) {
      showToast({ type: 'error', message: '密码必须包含字母和数字' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: '两次密码输入不一致' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await userApi.changePassword({
        oldPassword,
        newPassword
      });
      
      if (res.data.code === 0) {
        showToast({ type: 'success', message: '密码修改成功，请重新登录' });
        logout();
        router.push('/auth/login');
      } else {
        showToast({ type: 'error', message: res.data.message || '修改失败' });
      }
    } catch (error) {
      showToast({ type: 'error', message: '修改失败' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4 md:py-6 max-w-md">
      <h1 className="text-2xl font-bold mb-6">修改密码</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* 原密码 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              原密码 <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showOld ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="请输入原密码"
                className="input w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showOld ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* 新密码 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              新密码 <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="6-20位，包含字母和数字"
                className="input w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showNew ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {newPassword && (
              <div className="mt-2">
                <div className="flex items-center gap-2 text-xs">
                  <span>密码强度：</span>
                  <div className="flex-1 h-1 bg-gray-200 rounded overflow-hidden">
                    <div
                      className={`h-full transition-all ${strengthColors[strength]}`}
                      style={{ width: strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%' }}
                    />
                  </div>
                  <span className={strength === 'strong' ? 'text-green-600' : strength === 'medium' ? 'text-yellow-600' : 'text-red-600'}>
                    {strengthTexts[strength]}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 确认密码 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              确认密码 <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="请再次输入新密码"
                className="input w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showConfirm ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* 按钮 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn flex-1"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary flex-1"
            >
              {submitting ? '修改中...' : '确认修改'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
