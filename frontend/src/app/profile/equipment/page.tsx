'use client';

import { getPriceUnitShort } from '@/lib/utils/priceUnit';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { equipmentApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';

interface Equipment {
  id: string;
  model: string;
  images: string[];
  price: number;
  priceUnit: string;
  city: string;
  county: string;
  status: number;
  viewCount: number;
  contactCount: number;
  favoriteCount: number;
  rejectReason?: string;
}

const STATUS_MAP: Record<number, { label: string; color: string }> = {
  0: { label: '待审核', color: 'text-yellow-600 bg-yellow-50' },
  1: { label: '已发布', color: 'text-green-600 bg-green-50' },
  2: { label: '已拒绝', color: 'text-red-600 bg-red-50' },
  3: { label: '已下架', color: 'text-gray-600 bg-gray-50' },
};

export default function MyEquipmentPage() {
  const router = useRouter();
  const { showToast, showModal } = useAppStore();
  const { isLoggedIn } = useUserStore();

  const [status, setStatus] = useState<number | undefined>();
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  // 加载设备列表
  useEffect(() => {
    loadEquipments();
  }, [status, page]);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      const data: any = await equipmentApi.myList({ status, page, pageSize: 20 });
      setEquipments(data.data.list);
      setTotal(data.data.total);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showModal({
      title: '确认删除',
      content: '确定要删除这个设备吗？删除后无法恢复。',
      confirmText: '确认删除',
      cancelText: '取消',
    });

    if (confirmed) {
      try {
        await equipmentApi.delete(id);
        showToast({ type: 'success', message: '删除成功' });
        loadEquipments();
      } catch (error: any) {
        showToast({ type: 'error', message: error.message });
      }
    }
  };

  const handleToggleStatus = async (id: string, action: 'online' | 'offline') => {
    try {
      await equipmentApi.updateStatus(id, action);
      showToast({ type: 'success', message: action === 'online' ? '上架成功' : '下架成功' });
      loadEquipments();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-3 py-4 md:p-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">我的设备</h1>
        <Link
          href="/equipment/new"
          className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded text-sm md:text-base hover:bg-blue-700"
        >
          免费发布
        </Link>
      </div>

      {/* 状态筛选 - 移动端横向滚动 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-4 md:mb-6">
        <div className="flex border-b overflow-x-auto scrollbar-hide">
          {[
            { label: '全部', value: undefined },
            { label: '待审核', value: 0 },
            { label: '已发布', value: 1 },
            { label: '已拒绝', value: 2 },
            { label: '已下架', value: 3 },
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => {
                setStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 md:px-6 py-2.5 md:py-3 whitespace-nowrap text-sm md:text-base ${
                status === tab.value
                  ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 设备列表 */}
      {loading ? (
        <div className="text-center py-12">加载中...</div>
      ) : equipments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          暂无设备
          <Link href="/equipment/new" className="text-blue-600 ml-2">
            去发布
          </Link>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {equipments.map((equipment) => (
            <div key={equipment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 md:p-4">
              {/* 移动端：垂直布局，桌面端：水平布局 */}
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                {/* 设备图片 */}
                <img
                  src={equipment.images[0]}
                  alt={equipment.model}
                  className="w-full sm:w-28 md:w-32 h-40 sm:h-28 md:h-32 object-cover rounded"
                />

                {/* 设备信息 */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base md:text-lg font-semibold truncate">{equipment.model}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                        {equipment.city} {equipment.county}
                      </p>
                      <p className="text-blue-600 font-bold mt-1">
                        ¥{equipment.price}/{getPriceUnitShort(equipment.priceUnit)}
                      </p>
                    </div>

                    {/* 状态徽章 */}
                    <span className={`px-2 md:px-3 py-1 rounded text-xs md:text-sm whitespace-nowrap ${STATUS_MAP[equipment.status].color}`}>
                      {STATUS_MAP[equipment.status].label}
                    </span>
                  </div>

                  {/* 统计数据 */}
                  <div className="flex gap-3 md:gap-4 mt-2 md:mt-3 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    <span>浏览 {equipment.viewCount}</span>
                    <span>联系 {equipment.contactCount}</span>
                    <span>收藏 {equipment.favoriteCount}</span>
                  </div>

                  {/* 拒绝原因 */}
                  {equipment.status === 2 && equipment.rejectReason && (
                    <div className="mt-2 md:mt-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded text-xs md:text-sm">
                      拒绝原因：{equipment.rejectReason}
                    </div>
                  )}

                  {/* 操作按钮 - 移动端网格布局 */}
                  <div className="grid grid-cols-3 sm:flex gap-2 mt-3 md:mt-4">
                    {equipment.status === 1 && (
                      <>
                        <Link
                          href={`/orders/create?equipmentId=${equipment.id}`}
                          className="px-2 md:px-4 py-1.5 md:py-1 bg-green-600 text-white rounded text-xs md:text-sm text-center hover:bg-green-700"
                        >
                          推广
                        </Link>
                        <button
                          onClick={() => router.push(`/equipment/${equipment.id}/qrcode`)}
                          className="px-2 md:px-4 py-1.5 md:py-1 bg-blue-600 text-white rounded text-xs md:text-sm hover:bg-blue-700"
                        >
                          二维码
                        </button>
                      </>
                    )}
                    
                    <Link
                      href={`/equipment/${equipment.id}/edit`}
                      className="px-2 md:px-4 py-1.5 md:py-1 border dark:border-gray-600 rounded text-xs md:text-sm text-center hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      编辑
                    </Link>

                    {equipment.status === 1 && (
                      <button
                        onClick={() => handleToggleStatus(equipment.id, 'offline')}
                        className="px-2 md:px-4 py-1.5 md:py-1 border dark:border-gray-600 rounded text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        下架
                      </button>
                    )}

                    {equipment.status === 3 && (
                      <button
                        onClick={() => handleToggleStatus(equipment.id, 'online')}
                        className="px-2 md:px-4 py-1.5 md:py-1 border dark:border-gray-600 rounded text-xs md:text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        上架
                      </button>
                    )}

                    <Link
                      href={`/equipment/${equipment.id}`}
                      className="px-2 md:px-4 py-1.5 md:py-1 border dark:border-gray-600 rounded text-xs md:text-sm text-center hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      详情
                    </Link>

                    <button
                      onClick={() => handleDelete(equipment.id)}
                      className="px-2 md:px-4 py-1.5 md:py-1 border border-red-600 text-red-600 rounded text-xs md:text-sm hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      删除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 分页 */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 md:px-4 py-2 border dark:border-gray-600 rounded text-sm disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-3 md:px-4 py-2 text-sm">
            {page} / {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= Math.ceil(total / 20)}
            className="px-3 md:px-4 py-2 border dark:border-gray-600 rounded text-sm disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
