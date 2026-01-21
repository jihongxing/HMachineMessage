'use client';

import { getPriceUnitShort } from '@/lib/utils/priceUnit';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface Category {
  id: number;
  name: string;
  slug: string;
  children: Category[];
}

interface Region {
  id: number;
  name: string;
  code: string;
  level: number;
  parentId: number | null;
}

export default function Home() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory1, setSelectedCategory1] = useState<Category | null>(null);
  const [selectedCategory2, setSelectedCategory2] = useState<string>('');
  const [userCity, setUserCity] = useState('');
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // 地区选择相关 - 简化为省市两级
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    fetchUserLocation();
    fetchCategories();
    fetchProvinces();
  }, []);

  useEffect(() => {
    fetchEquipments();
  }, [userCity, selectedCategory1, selectedCategory2]);

  const fetchUserLocation = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/ip-location`);
      const data = await res.json();
      if (data.code === 0 && data.data?.city) {
        setUserCity(data.data.city);
      }
    } catch (error) {
      console.error(error);
      setUserCity('北京市');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/tree`);
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProvinces = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regions/provinces`);
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setProvinces(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCities = async (provinceId: number) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/regions/cities/${provinceId}`);
      const data = await res.json();
      if (data.code === 0 && data.data) {
        setCities(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      params.set('pageSize', '20');
      if (userCity) params.set('city', userCity);
      if (selectedCategory1) params.set('category1', selectedCategory1.name);
      if (selectedCategory2) params.set('category2', selectedCategory2);
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

  const handleCategory1Change = (category: Category | null) => {
    setSelectedCategory1(category);
    setSelectedCategory2('');
  };

  const handleProvinceSelect = (province: Region) => {
    setSelectedProvince(province);
    setCities([]);
    fetchCities(province.id);
    setStep(2);
  };

  const handleCitySelect = (city: Region) => {
    setUserCity(city.name);
    setShowCitySelector(false);
    setStep(1);
  };

  const handleCitySelectorClose = () => {
    setShowCitySelector(false);
    setStep(1);
    setSelectedProvince(null);
    setCities([]);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh' }}>
      {/* 城市选择弹窗 */}
      {showCitySelector && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={handleCitySelectorClose}
        >
          <div 
            className="w-full max-w-md"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b" style={{ 
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-divider)' 
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {step > 1 && (
                    <button 
                      onClick={() => {
                        setStep(1);
                        setSelectedProvince(null);
                        setCities([]);
                      }}
                      style={{ color: 'var(--color-primary)' }}
                    >
                      ← 返回
                    </button>
                  )}
                  <h3 className="text-lg font-bold">
                    {step === 1 && '选择省份'}
                    {step === 2 && '选择城市'}
                  </h3>
                </div>
                <button 
                  onClick={handleCitySelectorClose}
                  className="text-2xl"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  ×
                </button>
              </div>
              {step > 1 && (
                <div className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                  {selectedProvince?.name}
                </div>
              )}
            </div>
            <div className="p-4 overflow-auto flex-1">
              {step === 1 && (
                <div className="grid grid-cols-3 gap-2">
                  {provinces.map((province) => (
                    <button
                      key={province.id}
                      onClick={() => handleProvinceSelect(province)}
                      className="px-3 py-2 rounded text-sm transition hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {province.name}
                    </button>
                  ))}
                </div>
              )}
              {step === 2 && (
                <div className="grid grid-cols-3 gap-2">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className="px-3 py-2 rounded text-sm transition hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="card mb-0" style={{ borderRadius: 0 }}>
        <div className="container">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              📍 当前位置：
            </span>
            <button
              onClick={() => setShowCitySelector(true)}
              className="font-bold flex items-center gap-1 hover:opacity-80 transition"
              style={{ color: 'var(--color-primary)' }}
            >
              {userCity || '定位中...'}
              <span className="text-xs">▼</span>
            </button>
          </div>

          <div className="mb-3">
            <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
              设备类型：
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategory1Change(null)}
                className="px-3 py-1 rounded-full text-sm whitespace-nowrap transition"
                style={{
                  backgroundColor: !selectedCategory1 ? 'var(--color-primary)' : 'var(--bg-hover)',
                  color: !selectedCategory1 ? 'white' : 'var(--text-primary)',
                }}
              >
                全部
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategory1Change(cat)}
                  className="px-3 py-1 rounded-full text-sm whitespace-nowrap transition"
                  style={{
                    backgroundColor: selectedCategory1?.id === cat.id ? 'var(--color-primary)' : 'var(--bg-hover)',
                    color: selectedCategory1?.id === cat.id ? 'white' : 'var(--text-primary)',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {selectedCategory1 && selectedCategory1.children.length > 0 && (
            <div className="mb-2">
              <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                细分类型：
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory2('')}
                  className="px-3 py-1 rounded-full text-sm whitespace-nowrap transition"
                  style={{
                    backgroundColor: !selectedCategory2 ? 'var(--color-primary)' : 'var(--bg-hover)',
                    color: !selectedCategory2 ? 'white' : 'var(--text-primary)',
                  }}
                >
                  全部
                </button>
                {selectedCategory1.children.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory2(cat.name)}
                    className="px-3 py-1 rounded-full text-sm whitespace-nowrap transition"
                    style={{
                      backgroundColor: selectedCategory2 === cat.name ? 'var(--color-primary)' : 'var(--bg-hover)',
                      color: selectedCategory2 === cat.name ? 'white' : 'var(--text-primary)',
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base md:text-lg font-bold">
            {selectedCategory1 || selectedCategory2 ? '筛选结果' : '附近设备'}
          </h2>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {equipments.map((equipment) => (
              <Link
                key={equipment.id}
                href={`/equipment/${equipment.id}`}
                className="card p-0 hover:shadow-lg transition"
              >
                <div className="relative w-full h-32 md:h-48 bg-gray-200">
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
                <div className="p-3 md:p-4">
                  <h3 className="font-bold text-sm md:text-base mb-1 truncate">
                    {equipment.model}
                  </h3>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {equipment.category1} / {equipment.category2}
                  </p>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-tertiary)' }}>
                    📍 {equipment.city}{equipment.county}
                    {equipment.distance && ` · ${equipment.distance.toFixed(1)}km`}
                  </p>
                  <div className="text-base md:text-lg font-bold" style={{ color: 'var(--color-error)' }}>
                    ¥{equipment.price}
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      /{getPriceUnitShort(equipment.priceUnit)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
