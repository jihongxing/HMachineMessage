'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Empty, Loading, Pagination, Badge } from '@/components/ui';

export default function UsersPage() {
  const { showToast } = useAppStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUserList({
        keyword: keyword || undefined,
        page,
        pageSize: 20
      });
      console.log('Users response:', res);
      const data = res.data?.data || res.data || res;
      setUsers(data.list || data.items || []);
      setTotal(data.total || data.pagination?.total || 0);
    } catch (error: any) {
      console.error('Load users error:', error);
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadUsers();
  };

  const handleBan = async (id: string) => {
    const reason = prompt('请输入封禁原因：');
    if (!reason) return;

    const duration = prompt('封禁时长（天，0表示永久）：');
    if (duration === null) return;

    try {
      const res = await adminApi.updateUserStatus(id, {
        action: 'ban',
        reason,
        duration: parseInt(duration) || undefined
      });
      showToast({ type: 'success', message: '封禁成功' });
      loadUsers();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '操作失败' });
    }
  };

  const handleUnban = async (id: string) => {
    try {
      const res = await adminApi.updateUserStatus(id, { action: 'unban' });
      showToast({ type: 'success', message: '解封成功' });
      loadUsers();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '操作失败' });
    }
  };

  const getStatusBadge = (status: number) => {
    const map: Record<number, any> = {
      0: { variant: 'success', text: '正常' },
      1: { variant: 'error', text: '已封禁' }
    };
    const config = map[status] || { variant: 'default', text: '未知' };
    return <Badge variant={config.variant}>{config.text}</Badge>;
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
      <h1 className="text-2xl font-bold mb-6">用户管理</h1>

      <div className="card mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索手机号或昵称"
            className="input flex-1"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            搜索
          </button>
        </div>
      </div>

      {users.length === 0 ? (
        <Empty icon="👥" title="暂无用户" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4">用户</th>
                  <th className="text-left py-3 px-4">手机号</th>
                  <th className="text-left py-3 px-4">等级</th>
                  <th className="text-left py-3 px-4">状态</th>
                  <th className="text-left py-3 px-4">发布数</th>
                  <th className="text-left py-3 px-4">违规数</th>
                  <th className="text-left py-3 px-4">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-3 px-4">{user.nickname}</td>
                    <td className="py-3 px-4">{user.phone}</td>
                    <td className="py-3 px-4">Lv.{user.userLevel}</td>
                    <td className="py-3 px-4">{getStatusBadge(user.status)}</td>
                    <td className="py-3 px-4">{user.publishCount}</td>
                    <td className="py-3 px-4">{user.violationCount}</td>
                    <td className="py-3 px-4">
                      {user.status === 0 ? (
                        <button
                          onClick={() => handleBan(user.id)}
                          className="btn btn-sm"
                        >
                          封禁
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnban(user.id)}
                          className="btn btn-sm btn-primary"
                        >
                          解封
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            current={page}
            total={total}
            pageSize={20}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
