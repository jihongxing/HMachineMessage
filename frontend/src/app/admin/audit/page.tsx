'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Tabs, Empty, Loading, Pagination, Badge } from '@/components/ui';
import Image from 'next/image';

export default function AuditPage() {
  const { showToast, showModal } = useAppStore();
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [riskLevel, setRiskLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadEquipments();
  }, [riskLevel, page]);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingList({
        riskLevel: riskLevel === 'all' ? undefined : riskLevel,
        page,
        pageSize: 20
      });
      console.log('Audit response:', res);
      const data = res.data?.data || res.data || res;
      setEquipments(data.list || data.items || []);
      setTotal(data.total || data.pagination?.total || 0);
    } catch (error: any) {
      console.error('Load equipments error:', error);
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await adminApi.auditEquipment(id, { action, reason });
      showToast({ type: 'success', message: '审核成功' });
      loadEquipments();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '审核失败' });
    }
  };

  const handleReject = (id: string) => {
    const reason = prompt('请输入拒绝原因：');
    if (reason) {
      handleAudit(id, 'reject', reason);
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'high', label: '高风险' },
    { key: 'medium', label: '中风险' },
    { key: 'low', label: '低风险' }
  ];

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">设备审核</h1>

      <Tabs tabs={tabs} activeKey={riskLevel} onChange={setRiskLevel} />

      <div className="mt-6">
        {equipments.length === 0 ? (
          <Empty icon="✅" title="暂无待审核设备" />
        ) : (
          <>
            <div className="space-y-4">
              {equipments.map((equipment) => (
                <div key={equipment.id} className="card">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 bg-gray-200 rounded flex-shrink-0">
                      {equipment.images?.[0] && (
                        <Image
                          src={equipment.images[0]}
                          alt={equipment.model}
                          fill
                          className="object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold">{equipment.model}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {equipment.category1} / {equipment.category2}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            📍 {equipment.province} {equipment.city} {equipment.county}
                          </p>
                        </div>
                        {equipment.riskScore && (
                          <Badge variant={equipment.riskScore > 70 ? 'error' : equipment.riskScore > 40 ? 'warning' : 'success'}>
                            风险: {equipment.riskScore}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAudit(equipment.id, 'approve')}
                          className="btn btn-sm btn-primary"
                        >
                          通过
                        </button>
                        <button
                          onClick={() => handleReject(equipment.id)}
                          className="btn btn-sm"
                        >
                          拒绝
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
