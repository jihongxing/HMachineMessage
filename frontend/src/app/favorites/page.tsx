'use client';

import { getPriceUnitShort } from '@/lib/utils/priceUnit';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { favoriteApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import EquipmentCard from '@/components/EquipmentCard';

interface Equipment {
  id: string;
  model: string;
  category1: string;
  category2: string;
  province: string;
  city: string;
  county: string;
  price: number;
  priceUnit: string;
  images: string[];
  viewCount: number;
  favoriteCount: number;
}

interface Favorite {
  id: string;
  equipmentId: string;
  equipment: Equipment;
  createdAt: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pageSize = 20;

  // 等待客户端挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    // 检查登录状态
    const hasToken = typeof window !== 'undefined' && 
      (localStorage.getItem('access_token') || localStorage.getItem('token'));
    
    if (!hasToken && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    
    fetchFavorites();
  }, [mounted, isLoggedIn, page]);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteApi.getList({ page, pageSize });
      console.log('Favorites response:', res);
      setFavorites(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (equipmentId: string) => {
    if (!confirm('确定取消收藏？')) return;
    
    try {
      await favoriteApi.remove(equipmentId);
      showToast({ type: 'success', message: '已取消收藏' });
      fetchFavorites();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    }
  };

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="text-center" style={{ color: 'var(--text-secondary)' }}>加载中...</div>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-6">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-bold">我的收藏</h1>
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          共 {total} 条
        </span>
      </div>
      
      {favorites.length === 0 ? (
        <div className="card text-center py-12">
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>暂无收藏</p>
          <Link href="/equipment" className="btn btn-primary">
            去看看
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {favorites.map((item) => (
              <div key={item.id} className="relative">
                <EquipmentCard 
                  id={item.equipment.id}
                  model={item.equipment.model}
                  category1={item.equipment.category1}
                  category2={item.equipment.category2}
                  city={item.equipment.city}
                  county={item.equipment.county}
                  price={item.equipment.price}
                  priceUnit={item.equipment.priceUnit}
                  images={item.equipment.images}
                  viewCount={item.equipment.viewCount}
                />
                <button
                  onClick={() => removeFavorite(item.equipmentId)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                  }}
                >
                  ❤️
                </button>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {total > pageSize && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn"
                style={{
                  opacity: page === 1 ? 0.5 : 1,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                }}
              >
                上一页
              </button>
              <span className="px-4 py-2">
                {page} / {Math.ceil(total / pageSize)}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= Math.ceil(total / pageSize)}
                className="btn"
                style={{
                  opacity: page >= Math.ceil(total / pageSize) ? 0.5 : 1,
                  cursor: page >= Math.ceil(total / pageSize) ? 'not-allowed' : 'pointer',
                }}
              >
                下一页
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
