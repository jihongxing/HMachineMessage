'use client';

import { getPriceUnitShort } from '@/lib/utils/priceUnit';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useUserStore } from '@/lib/store';

interface Equipment {
  id: string;
  model: string;
  category1: string;
  category2: string;
  city: string;
  county: string;
  price: number;
  priceUnit: string;
  images: string[];
  distance?: number;
}

export default function Home() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn } = useUserStore();

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('pageSize', '8');
      params.set('sort', 'hot');

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment?${params}`);
      const data = await res.json();
      if (data.code === 0 && data.data?.list) {
        setEquipments(data.data.list);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* Hero区域 */}
      <section className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white pb-8 md:pb-0">
        <div className="container px-4 py-10 md:py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4">
              重型机械租赁平台
            </h1>
            <p className="text-sm md:text-lg text-blue-100 mb-8 md:mb-10">
              海量设备 · 快速对接 · 安全可靠 · 全国覆盖
            </p>

            {/* CTA按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/equipment"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition text-base md:text-lg shadow-lg"
              >
                🚜 浏览设备
              </Link>
              <Link
                href={isLoggedIn ? '/equipment/new' : '/auth/login'}
                className="px-8 py-4 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-400 transition border-2 border-blue-400 text-base md:text-lg"
              >
                ✨ 免费发布
              </Link>
            </div>
          </div>
        </div>
        
        {/* 装饰波浪 - 仅桌面端显示 */}
        <div className="absolute bottom-0 left-0 right-0 hidden md:block">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60V30C240 10 480 0 720 10C960 20 1200 40 1440 30V60H0Z" fill="var(--bg-page)" />
          </svg>
        </div>
      </section>

      {/* 核心价值区 */}
      <section className="container px-4 py-8 md:py-12">
        <div className="grid grid-cols-4 gap-2 md:gap-6">
          {[
            { icon: '🚜', title: '海量设备', desc: '覆盖各类重型机械' },
            { icon: '⚡', title: '快速对接', desc: '一键联系设备方' },
            { icon: '🆓', title: '免费发布', desc: '零成本发布设备' },
            { icon: '🌍', title: '全国覆盖', desc: '服务遍布全国各地' },
          ].map((item, index) => (
            <div
              key={index}
              className="card p-2 md:p-6 text-center hover:shadow-lg transition"
            >
              <div className="text-2xl md:text-4xl mb-1 md:mb-3">{item.icon}</div>
              <h3 className="font-bold text-xs md:text-base mb-0.5 md:mb-1">{item.title}</h3>
              <p className="text-[10px] md:text-sm hidden md:block" style={{ color: 'var(--text-secondary)' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 推荐设备 */}
      <section className="container px-4 pb-8 md:pb-12">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-lg md:text-xl font-bold">热门设备</h2>
          <Link
            href="/equipment"
            className="text-sm"
            style={{ color: 'var(--color-primary)' }}
          >
            查看更多 →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>
            加载中...
          </div>
        ) : equipments.length === 0 ? (
          <div className="card text-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>暂无设备</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {equipments.map((equipment) => (
              <Link
                key={equipment.id}
                href={`/equipment/${equipment.id}`}
                className="card p-0 hover:shadow-lg transition"
              >
                <div className="relative w-full h-32 md:h-44 bg-gray-200">
                  {equipment.images?.[0] ? (
                    <Image
                      src={equipment.images[0]}
                      alt={equipment.model}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-tertiary)' }}>
                      暂无图片
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-1 truncate">
                    {equipment.model}
                  </h3>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-tertiary)' }}>
                    📍 {equipment.city}{equipment.county}
                  </p>
                  <div className="text-sm md:text-base font-bold" style={{ color: 'var(--color-error)' }}>
                    ¥{equipment.price}
                    <span className="text-xs font-normal" style={{ color: 'var(--text-tertiary)' }}>
                      /{getPriceUnitShort(equipment.priceUnit)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 底部信息 */}
      <footer className="border-t" style={{ borderColor: 'var(--border-divider)', backgroundColor: 'var(--bg-card)' }}>
        <div className="container px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* 关于我们 */}
            <div>
              <h3 className="font-bold mb-3 text-sm md:text-base">关于我们</h3>
              <p className="text-xs md:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                重型机械租赁平台致力于为用户提供便捷、安全的机械设备租赁服务，连接设备方与需求方，让重型机械租赁更简单。
              </p>
            </div>

            {/* 快速链接 */}
            <div>
              <h3 className="font-bold mb-3 text-sm md:text-base">快速链接</h3>
              <div className="grid grid-cols-2 gap-2">
                <Link href="/equipment" className="text-xs md:text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                  设备列表
                </Link>
                <Link href="/equipment/new" className="text-xs md:text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                  免费发布
                </Link>
                <Link href="/orders" className="text-xs md:text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                  我的订单
                </Link>
                <Link href="/profile" className="text-xs md:text-sm hover:underline" style={{ color: 'var(--text-secondary)' }}>
                  个人中心
                </Link>
              </div>
            </div>

            {/* 联系方式 */}
            <div>
              <h3 className="font-bold mb-3 text-sm md:text-base">联系我们</h3>
              <div className="space-y-2 text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p>📧 jhx800@163.com</p>
                <p>📞 400-855-1985</p>
                <p>🕐 工作时间：9:00 - 18:00</p>
              </div>
            </div>
          </div>

          {/* 版权信息 */}
          <div className="mt-6 md:mt-8 pt-6 border-t text-center" style={{ borderColor: 'var(--border-divider)' }}>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              © 2024 重型机械租赁平台 · 
              <Link href="/agreement" className="hover:underline mx-1">用户协议</Link> · 
              <Link href="/privacy" className="hover:underline mx-1">隐私政策</Link>
            </p>
          </div>
        </div>
      </footer>

      {/* 移动端底部占位 */}
      <div className="h-14 md:hidden" />
    </div>
  );
}
