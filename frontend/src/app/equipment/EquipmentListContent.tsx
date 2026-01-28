'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { equipmentApi, categoryApi, regionApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import EquipmentCard from '@/components/EquipmentCard';
import Pagination from '@/components/ui/Pagination';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import { getPriceUnitShort } from '@/lib/utils/priceUnit';

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
  viewCount: number;
  rankLevel?: number;
}

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface Region {
  id: number;
  name: string;
}

export default function EquipmentListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useAppStore();

  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 筛选条件
  const [categories, setCategories] = useState<Category[]>([]);
  const [category1, setCategory1] = useState('');
  const [category2, setCategory2] = useState('');
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);
  const [selectedCityId, setSelectedCityId] = useState<number>(0);
  const [sortBy, setSortBy] = useState('latest');

  // 展开状态
  const [showProvinces, setShowProvinces] = useState(false);
  const [showCities, setShowCities] = useState(false);

  // 初始化
  useEffect(() => {
    loadCategories();
    loadProvinces();
    
    const urlCategory1 = searchParams.get('category1');
    const urlCategory2 = searchParams.get('category2');
    const urlProvinceId = searchParams.get('provinceId');
    const urlCityId = searchParams.get('cityId');
    const urlSort = searchParams.get('sort');
    
    if (urlCategory1) setCategory1(urlCategory1);
    if (urlCategory2) setCategory2(urlCategory2);
    if (urlProvinceId) setSelectedProvinceId(parseInt(urlProvinceId));
    if (urlCityId) setSelectedCityId(parseInt(urlCityId));
    if (urlSort) setSortBy(urlSort);
  }, []);

  const loadCategories = async () => {
    try {
      const res = await categoryApi.getTree();
      setCategories(res.data || []);
    } catch (error: any) {
      console.error('加载分类失败:', error);
    }
  };

  const loadProvinces = async () => {
    try {
      const res = await regionApi.getProvinces();
      setProvinces(res.data || []);
    } catch (error: any) {
      console.error('加载省份失败:', error);
    }
  };

  const loadCities = async (provinceId: number) => {
    try {
      const res = await regionApi.getCities(provinceId);
      setCities(res.data || []);
    } catch (error: any) {
      console.error('加载城市失败:', error);
    }
  };

  const handleCategory1Select = (name: string) => {
    setCategory1(name);
    setCategory2('');
    setPage(1);
  };

  const handleCategory2Select = (name: string) => {
    setCategory2(name);
    setPage(1);
  };

  const handleProvinceSelect = (provinceId: number) => {
    setSelectedProvinceId(provinceId);
    setSelectedCityId(0);
    setCities([]);
    setShowProvinces(false);
    setPage(1);
    if (provinceId) {
      loadCities(provinceId);
      setShowCities(true);
    }
  };

  const handleCitySelect = (cityId: number) => {
    setSelectedCityId(cityId);
    setShowCities(false);
    setPage(1);
  };

  const getCategory2List = () => {
    if (!category1) return [];
    const cat1 = categories.find(c => c.name === category1);
    return cat1?.children || [];
  };

  useEffect(() => {
    fetchEquipments();
  }, [page, category1, category2, selectedProvinceId, selectedCityId, sortBy]);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const params: any = { page, pageSize };
      if (category1) params.category1 = category1;
      if (category2) params.category2 = category2;
      if (selectedProvinceId) params.provinceId = selectedProvinceId;
      if (selectedCityId) params.cityId = selectedCityId;
      if (sortBy) params.sort = sortBy;

      const res = await equipmentApi.getList(params);
      setEquipments(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCategory1('');
    setCategory2('');
    setSelectedProvinceId(0);
    setSelectedCityId(0);
    setSortBy('latest');
    setPage(1);
    router.push('/equipment');
  };

  const getSelectedProvinceName = () => {
    const p = provinces.find(p => p.id === selectedProvinceId);
    return p?.name || '';
  };

  const getSelectedCityName = () => {
    const c = cities.find(c => c.id === selectedCityId);
    return c?.name || '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-3 py-4">
        
        {/* 分类选择 - 大按钮横向滚动 */}
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3">
            <button
              onClick={() => handleCategory1Select('')}
              className={`flex-shrink-0 px-5 py-3 rounded-full text-base font-medium transition ${
                !category1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
              }`}
            >
              全部设备
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategory1Select(cat.name)}
                className={`flex-shrink-0 px-5 py-3 rounded-full text-base font-medium transition ${
                  category1 === cat.name 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* 子分类 - 选中一级分类后显示 */}
        {category1 && getCategory2List().length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3">
              <button
                onClick={() => handleCategory2Select('')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                  !category2 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                全部
              </button>
              {getCategory2List().map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategory2Select(cat.name)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                    category2 === cat.name 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 地区和排序 */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {/* 省份选择 */}
          <div className="relative">
            <button
              onClick={() => { setShowProvinces(!showProvinces); setShowCities(false); }}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                selectedProvinceId 
                  ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' 
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              {selectedProvinceId ? getSelectedProvinceName() : '选择省份'} ▼
            </button>
            {showProvinces && (
              <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto w-48">
                <button
                  onClick={() => handleProvinceSelect(0)}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  全部省份
                </button>
                {provinces.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProvinceSelect(p.id)}
                    className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedProvinceId === p.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : ''
                    }`}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 城市选择 */}
          {selectedProvinceId > 0 && cities.length > 0 && (
            <div className="relative">
              <button
                onClick={() => { setShowCities(!showCities); setShowProvinces(false); }}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition ${
                  selectedCityId 
                    ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300' 
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                }`}
              >
                {selectedCityId ? getSelectedCityName() : '选择城市'} ▼
              </button>
              {showCities && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto w-48">
                  <button
                    onClick={() => handleCitySelect(0)}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    全部城市
                  </button>
                  {cities.map(c => (
                    <button
                      key={c.id}
                      onClick={() => handleCitySelect(c.id)}
                      className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        selectedCityId === c.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : ''
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 排序 */}
          <div className="flex gap-1 ml-auto">
            {[
              { value: 'latest', label: '最新' },
              { value: 'views', label: '热门' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                className={`px-3 py-2 rounded text-sm transition ${
                  sortBy === opt.value 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 当前筛选 + 重置 */}
        {(category1 || selectedProvinceId) && (
          <div className="flex items-center gap-2 mb-4 text-sm">
            <span className="text-gray-500">当前：</span>
            {category1 && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">{category1}</span>}
            {category2 && <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded">{category2}</span>}
            {selectedProvinceId > 0 && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded">{getSelectedProvinceName()}</span>}
            {selectedCityId > 0 && <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded">{getSelectedCityName()}</span>}
            <button onClick={handleReset} className="text-gray-500 hover:text-red-500">✕ 清除</button>
          </div>
        )}

        {/* 结果数量 */}
        <div className="mb-3 text-sm text-gray-500">
          共 <span className="font-bold text-blue-600">{total}</span> 个设备
        </div>

        {/* 设备列表 */}
        {loading ? (
          <Loading />
        ) : equipments.length === 0 ? (
          <Empty title="暂无设备" description="试试其他分类或地区" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {equipments.map((equipment) => (
                <EquipmentCard
                  key={equipment.id}
                  id={equipment.id}
                  model={equipment.model}
                  category1={equipment.category1}
                  category2={equipment.category2}
                  city={equipment.city}
                  county={equipment.county}
                  price={equipment.price}
                  priceUnit={getPriceUnitShort(equipment.priceUnit)}
                  images={equipment.images}
                  viewCount={equipment.viewCount}
                  rankLevel={equipment.rankLevel}
                />
              ))}
            </div>

            <div className="mt-6">
              <Pagination
                current={page}
                total={total}
                pageSize={pageSize}
                onChange={setPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
