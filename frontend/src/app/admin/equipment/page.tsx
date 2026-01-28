'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Tabs, Empty, Loading, Pagination, Badge } from '@/components/ui';
import Image from 'next/image';
import Link from 'next/link';

const STATUS_MAP: Record<number, { label: string; variant: 'default' | 'success' | 'warning' | 'error' }> = {
  0: { label: '待审核', variant: 'warning' },
  1: { label: '已发布', variant: 'success' },
  2: { label: '已拒绝', variant: 'error' },
  3: { label: '已下架', variant: 'default' },
};

export default function EquipmentManagePage() {
  const { showToast } = useAppStore();
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    loadEquipments();
  }, [statusFilter, page]);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize: 20 };
      if (statusFilter !== 'all') {
        params.status = parseInt(statusFilter);
      }
      if (keyword) {
        params.keyword = keyword;
      }
      const res = await adminApi.getEquipmentList(params);
      const data = res.data || res;
      setEquipments(data.list || []);
      setTotal(data.total || 0);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    loadEquipments();
  };

  const handleStatusChange = async (id: string, status: number) => {
    try {
      await adminApi.updateEquipmentStatus(id, status);
      showToast({ type: 'success', message: '状态更新成功' });
      loadEquipments();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '操作失败' });
    }
  };

  const handleBatchStatusChange = async (status: number) => {
    if (selectedIds.length === 0) {
      showToast({ type: 'warning', message: '请先选择设备' });
      return;
    }
    try {
      await adminApi.batchUpdateEquipmentStatus(selectedIds, status);
      showToast({ type: 'success', message: `批量更新${selectedIds.length}条成功` });
      setSelectedIds([]);
      loadEquipments();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '操作失败' });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === equipments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(equipments.map(e => e.id));
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: '0', label: '待审核' },
    { key: '1', label: '已发布' },
    { key: '2', label: '已拒绝' },
    { key: '3', label: '已下架' },
  ];

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">设备管理</h1>

      {/* 搜索栏 */}
      <div className="card mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="搜索设备型号..."
            className="flex-1 px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <button onClick={handleSearch} className="btn btn-primary">搜索</button>
        </div>
      </div>

      {/* 状态筛选 */}
      <Tabs tabs={tabs} activeKey={statusFilter} onChange={(key) => { setStatusFilter(key); setPage(1); }} />

      {/* 批量操作 */}
      {selectedIds.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center gap-3">
          <span className="text-sm">已选择 {selectedIds.length} 项</span>
          <button onClick={() => handleBatchStatusChange(1)} className="btn btn-sm btn-primary">批量发布</button>
          <button onClick={() => handleBatchStatusChange(3)} className="btn btn-sm">批量下架</button>
          <button onClick={() => setSelectedIds([])} className="btn btn-sm">取消选择</button>
        </div>
      )}

      {/* 列表 */}
      <div className="mt-6">
        {loading ? (
          <Loading size="lg" />
        ) : equipments.length === 0 ? (
          <Empty title="暂无设备" />
        ) : (
          <>
            {/* 全选 */}
            <div className="mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === equipments.length && equipments.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
                <span className="text-sm">全选</span>
              </label>
            </div>

            <div className="space-y-3">
              {equipments.map((equipment) => (
                <div key={equipment.id} className="card">
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(equipment.id)}
                        onChange={() => toggleSelect(equipment.id)}
                        className="w-4 h-4"
                      />
                    </label>
                    <div className="relative w-20 h-20 bg-gray-200 rounded flex-shrink-0">
                      {equipment.images?.[0] && (
                        <Image
                          src={equipment.images[0]}
                          alt={equipment.model}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/equipment/${equipment.id}`} className="font-bold hover:text-blue-600 truncate block">
                            {equipment.model}
                          </Link>
                          <p className="text-sm text-gray-500 truncate">
                            {equipment.category1} / {equipment.category2}
                          </p>
                          <p className="text-sm text-gray-500">
                            📍 {equipment.province} {equipment.city} {equipment.county}
                          </p>
                          <p className="text-sm text-gray-500">
                            发布者: {equipment.user?.nickname} ({equipment.user?.phone})
                          </p>
                        </div>
                        <Badge variant={STATUS_MAP[equipment.status]?.variant || 'default'}>
                          {STATUS_MAP[equipment.status]?.label || '未知'}
                        </Badge>
                      </div>
                      <div className="flex gap-2 mt-2">
                        {equipment.status !== 1 && (
                          <button
                            onClick={() => handleStatusChange(equipment.id, 1)}
                            className="btn btn-sm btn-primary"
                          >
                            发布
                          </button>
                        )}
                        {equipment.status !== 3 && (
                          <button
                            onClick={() => handleStatusChange(equipment.id, 3)}
                            className="btn btn-sm"
                          >
                            下架
                          </button>
                        )}
                        {equipment.status !== 0 && (
                          <button
                            onClick={() => handleStatusChange(equipment.id, 0)}
                            className="btn btn-sm"
                          >
                            重新审核
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Pagination current={page} total={total} pageSize={20} onChange={setPage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
