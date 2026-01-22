'use client';

import { getPriceUnitShort } from '@/lib/utils/priceUnit';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import StructuredData from '@/components/StructuredData';
import Image from 'next/image';
import { equipmentApi, favoriteApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import { Modal } from '@/components/ui';

interface Equipment {
  id: string;
  model: string;
  category1: string;
  category2: string;
  province: string;
  city: string;
  county: string;
  address: string;
  price: number;
  priceUnit: string;
  phone: string;
  wechat?: string;
  images: string[];
  description?: string;
  viewCount: number;
  contactCount: number;
  favoriteCount: number;
  rating: number;
  ratingCount: number;
  user: {
    id: string;
    nickname: string;
    avatar?: string;
    userLevel: number;
  };
  createdAt: string;
}

export default function EquipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showWechat, setShowWechat] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [wechatNumber, setWechatNumber] = useState('');
  const [mounted, setMounted] = useState(false);
  const [structuredData, setStructuredData] = useState<any>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrcodeUrl, setQrcodeUrl] = useState<string>('');
  const [qrLoading, setQrLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    fetchEquipment();
    checkFavorite();
  }, [mounted, params.id]);

  const fetchEquipment = async () => {
    try {
      const res = await equipmentApi.getDetail(params.id as string);
      setEquipment(res.data);
      
      // 获取结构化数据
      try {
        const seoRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/structured-data/${params.id}`);
        if (seoRes.ok) {
          const seoData = await seoRes.json();
          if (seoData.code === 0) {
            setStructuredData(seoData.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch structured data:', error);
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    if (!isLoggedIn) return;
    try {
      const res = await favoriteApi.check(params.id as string);
      setIsFavorited(res.data.isFavorited);
    } catch (error) {
      // 忽略错误
    }
  };

  const handleFavorite = async () => {
    if (!isLoggedIn) {
      showToast({ type: 'info', message: '请先登录' });
      router.push('/auth/login');
      return;
    }

    try {
      if (isFavorited) {
        await favoriteApi.remove(params.id as string);
        setIsFavorited(false);
        showToast({ type: 'success', message: '已取消收藏' });
      } else {
        await favoriteApi.add(params.id as string);
        setIsFavorited(true);
        showToast({ type: 'success', message: '收藏成功' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    }
  };

  const handleViewContact = async (type: 'phone' | 'wechat') => {
    if (!isLoggedIn) {
      showToast({ type: 'info', message: '请先登录' });
      router.push('/auth/login');
      return;
    }

    try {
      const res = await equipmentApi.viewContact(params.id as string, type);
      if (type === 'phone' && res.data.phone) {
        setPhoneNumber(res.data.phone);
        setShowPhone(true);
      } else if (type === 'wechat' && res.data.wechat) {
        setWechatNumber(res.data.wechat);
        setShowWechat(true);
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    }
  };

  const generateQRCode = async () => {
    if (qrcodeUrl) {
      setShowQRModal(true);
      return;
    }

    setQrLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/qrcode/equipment/${params.id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        setQrcodeUrl(data.data.qrcodeUrl);
        setShowQRModal(true);
      } else {
        showToast({ type: 'error', message: data.message || '生成失败' });
      }
    } catch (error) {
      showToast({ type: 'error', message: '生成二维码失败' });
    } finally {
      setQrLoading(false);
    }
  };

  if (loading) {
    return <div className="container py-8 text-center">加载中...</div>;
  }

  if (!equipment) {
    return <div className="container py-8 text-center">设备不存在</div>;
  }

  return (
    <div className="container py-4 md:py-6">
      {/* SEO结构化数据 */}
      {structuredData && <StructuredData data={structuredData} />}
      
      <Breadcrumb
        items={[
          { label: equipment.category1, href: `/equipment?category1=${equipment.category1}` },
          { label: equipment.category2, href: `/equipment?category1=${equipment.category1}&category2=${equipment.category2}` },
          { label: equipment.model },
        ]}
      />

      <div className="card mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 md:gap-6">
          {/* 左侧：图片和信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* 图片 */}
            <div>
              {equipment.images && equipment.images.length > 0 && (
                <div className="relative w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden">
                  <Image src={equipment.images[0]} alt={equipment.model} fill className="object-cover" priority />
                </div>
              )}
            </div>

            {/* 信息 */}
            <div>
            <h1 className="text-xl md:text-3xl font-bold mb-4">{equipment.model}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-6">
              <span>{equipment.category1} / {equipment.category2}</span>
              <span>{equipment.city}{equipment.county}</span>
              <span>浏览 {equipment.viewCount}</span>
            </div>

            <div className="mb-6">
              <span className="text-2xl md:text-3xl font-bold text-red-600">¥{equipment.price}</span>
              <span className="text-gray-600 ml-2">/ {getPriceUnitShort(equipment.priceUnit)}</span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex">
                <span className="text-gray-600 w-20">位置：</span>
                <span>{equipment.province}{equipment.city}{equipment.county}</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 w-20">联系电话：</span>
                {showPhone ? (
                  <span className="font-medium">{phoneNumber}</span>
                ) : (
                  <button
                    onClick={() => handleViewContact('phone')}
                    className="text-blue-600 hover:text-blue-700 underline"
                  >
                    点击查看
                  </button>
                )}
              </div>
              {equipment.wechat && (
                <div className="flex items-center">
                  <span className="text-gray-600 w-20">微信：</span>
                  {showWechat ? (
                    <span className="font-medium">{wechatNumber}</span>
                  ) : (
                    <button
                      onClick={() => handleViewContact('wechat')}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      点击查看
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFavorite}
                className={`btn flex-1 ${isFavorited ? 'bg-red-50 text-red-600 border-red-200' : ''}`}
              >
                {isFavorited ? '❤️ 已收藏' : '🤍 收藏'}
              </button>
              <button
                onClick={generateQRCode}
                disabled={qrLoading}
                className="btn lg:hidden"
              >
                {qrLoading ? '⏳' : '📱'} 二维码
              </button>
            </div>
            
            {/* 推广按钮（仅设备所有者可见） */}
            <div className="mt-3">
              <a 
                href={`/orders/create?equipmentId=${equipment.id}`} 
                className="btn w-full bg-green-600 text-white hover:bg-green-700 text-center block"
              >
                🚀 推广此设备
              </a>
              <p className="text-xs text-gray-500 mt-1 text-center">
                提升排名，获得更多曝光
              </p>
            </div>
            </div>
          </div>

          {/* 右侧：二维码（桌面端显示） */}
          <div className="hidden lg:block">
            <div className="sticky top-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-center">
              <h3 className="text-sm font-medium mb-3">扫码分享</h3>
              {qrcodeUrl ? (
                <div>
                  <img src={qrcodeUrl} alt="设备二维码" className="w-40 h-40 mx-auto" />
                  <p className="text-xs text-gray-500 mt-2">扫码查看设备详情</p>
                </div>
              ) : (
                <button
                  onClick={generateQRCode}
                  disabled={qrLoading}
                  className="btn btn-sm w-full"
                >
                  {qrLoading ? '生成中...' : '生成二维码'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 描述 */}
        {equipment.description && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg md:text-xl font-bold mb-3">设备描述</h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{equipment.description}</p>
          </div>
        )}

        {/* 发布者 */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-lg md:text-xl font-bold mb-3">发布者信息</h2>
          <div className="flex items-center gap-3">
            {equipment.user.avatar && (
              <div className="relative w-12 h-12 rounded-full overflow-hidden">
                <Image src={equipment.user.avatar} alt={equipment.user.nickname} fill />
              </div>
            )}
            <div>
              <div className="font-medium">{equipment.user.nickname}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {['新用户', '普通用户', '优质用户', '认证用户'][equipment.user.userLevel]}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 移动端二维码弹窗 */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="设备二维码"
      >
        <div className="text-center py-4">
          {qrcodeUrl && (
            <>
              <img src={qrcodeUrl} alt="设备二维码" className="w-64 h-64 mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                扫码查看设备详情
              </p>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrcodeUrl;
                  link.download = `equipment-${equipment.id}-qrcode.png`;
                  link.click();
                }}
                className="btn btn-primary mt-4"
              >
                下载二维码
              </button>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
