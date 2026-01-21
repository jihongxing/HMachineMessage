'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppStore, useUserStore } from '@/lib/store';
import apiClient from '@/lib/api/client';
import Image from 'next/image';

export default function QRCodePage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();
  
  const [equipment, setEquipment] = useState<any>(null);
  const [qrcodeUrl, setQrcodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const hasToken = typeof window !== 'undefined' && 
      (localStorage.getItem('access_token') || localStorage.getItem('token'));
    
    if (!hasToken && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
    
    loadEquipment();
  }, [mounted, params.id, isLoggedIn]);

  const loadEquipment = async () => {
    try {
      const res = await apiClient.get(`/equipment/${params.id}`);
      const equipmentData = res.data?.data || res.data;
      setEquipment(equipmentData);
      if (equipmentData?.qrcodeUrl) {
        setQrcodeUrl(equipmentData.qrcodeUrl);
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
      router.push('/profile/equipment');
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    setGenerating(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await apiClient.post(`/qrcode/equipment/${params.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const qrUrl = res.data?.data?.qrcodeUrl || res.data?.qrcodeUrl;
      setQrcodeUrl(qrUrl);
      showToast({ type: 'success', message: '二维码生成成功' });
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const regenerateQRCode = async () => {
    if (!confirm('确定要重新生成二维码吗？')) return;
    
    setGenerating(true);
    try {
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      const res = await apiClient.post(`/qrcode/equipment/${params.id}/regenerate`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const qrUrl = res.data?.data?.qrcodeUrl || res.data?.qrcodeUrl;
      setQrcodeUrl(qrUrl);
      showToast({ type: 'success', message: '二维码重新生成成功' });
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setGenerating(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrcodeUrl) return;
    
    const link = document.createElement('a');
    link.href = qrcodeUrl;
    link.download = `qrcode-${params.id}.png`;
    link.click();
  };

  if (loading) {
    return (
      <div className="container py-12 text-center">
        <div className="text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container py-4 md:py-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">设备二维码</h1>

      {/* 设备信息 */}
      <div className="card mb-6">
        <div className="flex gap-4">
          {equipment?.images?.[0] && (
            <div className="relative w-20 h-20 bg-gray-200 rounded flex-shrink-0">
              <Image
                src={equipment.images[0]}
                alt={equipment.model}
                fill
                className="object-cover rounded"
              />
            </div>
          )}
          <div className="flex-1">
            <h3 className="font-bold mb-1">{equipment?.model}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {equipment?.category1} · {equipment?.category2}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {equipment?.city} {equipment?.county}
            </p>
          </div>
        </div>
      </div>

      {/* 二维码展示 */}
      <div className="card text-center">
        {qrcodeUrl ? (
          <>
            <div className="mb-6">
              <img
                src={qrcodeUrl}
                alt="设备二维码"
                className="mx-auto w-64 h-64 border-4 border-gray-200 rounded-lg"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              扫描二维码查看设备详情
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={downloadQRCode}
                className="btn btn-primary"
              >
                下载二维码
              </button>
              <button
                onClick={regenerateQRCode}
                disabled={generating}
                className="btn"
              >
                {generating ? '生成中...' : '重新生成'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                还没有生成二维码
              </p>
              <button
                onClick={generateQRCode}
                disabled={generating}
                className="btn btn-primary"
              >
                {generating ? '生成中...' : '生成二维码'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* 使用说明 */}
      <div className="card mt-6">
        <h2 className="font-bold mb-3">使用说明</h2>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <li>• 将二维码打印或分享给客户</li>
          <li>• 客户扫码可直接查看设备详情</li>
          <li>• 系统会自动统计扫码次数</li>
          <li>• 可在设备管理中查看扫码统计</li>
        </ul>
      </div>

      {/* 扫码统计 */}
      {qrcodeUrl && (
        <div className="card mt-6">
          <h2 className="font-bold mb-3">扫码统计</h2>
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {equipment?.scanCount || 0}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              累计扫码次数
            </div>
          </div>
        </div>
      )}

      {/* 返回按钮 */}
      <div className="mt-6">
        <button onClick={() => router.back()} className="btn w-full">
          返回
        </button>
      </div>
    </div>
  );
}
