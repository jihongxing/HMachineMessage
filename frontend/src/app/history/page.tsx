'use client';

import { getPriceUnitShort } from '@/lib/utils/priceUnit';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HistoryItem {
  equipmentId: string;
  equipment: {
    id: string;
    model: string;
    category1: string;
    category2: string;
    city: string;
    county: string;
    price: number;
    priceUnit: string;
    images: string[];
  };
  viewedAt: string;
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.list) {
        setHistory(data.data.list);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm('确定清空浏览历史？')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/history`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.code === 0) {
        setHistory([]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>加载中...</div>
      </div>
    );
  }

  if (!localStorage.getItem('token')) {
    return (
      <div className="container py-8 md:py-12 max-w-md">
        <div className="card text-center">
          <h2 className="text-xl font-bold mb-4">未登录</h2>
          <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>请先登录后查看历史</p>
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
    <div className="container py-4 md:py-6">
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">浏览历史</h1>
        {history.length > 0 && (
          <button 
            onClick={clearHistory} 
            className="text-sm md:text-base"
            style={{ color: 'var(--color-error)' }}
          >
            清空历史
          </button>
        )}
      </div>
      
      {history.length === 0 ? (
        <div className="card text-center py-12">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>暂无浏览历史</p>
          <Link href="/equipment" className="btn btn-primary">
            去看看
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {history.map((item) => (
            <Link
              key={item.equipmentId}
              href={`/equipment/${item.equipment.id}`}
              className="card p-0 hover:shadow-lg transition"
            >
              <div className="relative w-full h-32 md:h-48 bg-gray-200">
                {item.equipment.images?.[0] ? (
                  <Image
                    src={item.equipment.images[0]}
                    alt={item.equipment.model}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>
                    暂无图片
                  </div>
                )}
              </div>
              <div className="p-3 md:p-4">
                <h3 className="font-bold text-sm md:text-base mb-1 truncate">
                  {item.equipment.model}
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {item.equipment.category1} / {item.equipment.category2}
                </p>
                <p className="text-xs my-2" style={{ color: 'var(--text-tertiary)' }}>
                  📍 {item.equipment.city}{item.equipment.county}
                </p>
                <div className="text-base md:text-lg font-bold mb-2" style={{ color: 'var(--color-error)' }}>
                  ¥{item.equipment.price}
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    /{item.equipment.priceUnit === 'day' ? '天' : '时'}
                  </span>
                </div>
                <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(item.viewedAt).toLocaleString('zh-CN', {
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
