'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { userApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import { Upload } from '@/components/ui';

export default function EditProfilePage() {
  const router = useRouter();
  const { showToast } = useAppStore();
  const { isLoggedIn, user, updateUser } = useUserStore();
  
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    
    if (user) {
      setNickname(user.nickname || '');
      setAvatar(user.avatar ? [user.avatar] : []);
    }
  }, [isLoggedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nickname.trim()) {
      showToast({ type: 'error', message: '请输入昵称' });
      return;
    }
    
    if (nickname.length < 2 || nickname.length > 20) {
      showToast({ type: 'error', message: '昵称长度为2-20个字符' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await userApi.updateProfile({
        nickname: nickname.trim(),
        avatar: avatar[0] || undefined
      });
      
      if (res.data.code === 0) {
        updateUser(res.data.data);
        showToast({ type: 'success', message: '保存成功' });
        router.push('/profile');
      } else {
        showToast({ type: 'error', message: res.data.message || '保存失败' });
      }
    } catch (error) {
      showToast({ type: 'error', message: '保存失败' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4 md:py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">编辑资料</h1>

      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* 头像 */}
          <div>
            <label className="block text-sm font-medium mb-2">头像</label>
            <Upload
              value={avatar}
              onChange={setAvatar}
              maxCount={1}
              accept="image/jpeg,image/jpg,image/png"
            />
          </div>

          {/* 昵称 */}
          <div>
            <label className="block text-sm font-medium mb-2">
              昵称 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="请输入昵称"
              maxLength={20}
              className="input w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              {nickname.length}/20
            </p>
          </div>

          {/* 手机号（只读） */}
          <div>
            <label className="block text-sm font-medium mb-2">手机号</label>
            <input
              type="text"
              value={user?.phone || ''}
              disabled
              className="input w-full bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
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
              {submitting ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
