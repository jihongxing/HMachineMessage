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
  const [keyword, setKeyword] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [category1, setCategory1] = useState('');
  const [category2, setCategory2] = useState('');
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(0);
  const [selectedCityId, setSelectedCityId] = useState<number>(0);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sortBy, setSortBy] = useState('latest');

  // 初始化：加载分类和地区数据
  useEffect(() => {
    loadCategories();
    loadProvinces();
    
    // 从URL参数恢复筛选条件
    const urlKeyword = searchParams.get('keyword');
    const urlCategory1 = searchParams.get('category1');
    const urlCategory2 = searchParams.get('category2');
    const urlProvinceId = searchParams.get('provinceId');
    const urlCityId = searchParams.get('cityId');
    const urlSort = searchParams.get('sort');
    
    if (urlKeyword) setKeyword(urlKeyword);
    if (urlCategory1) setCategory1(urlCategory1);
    if (urlCategory2) setCategory2(urlCategory2);
    if (urlProvinceId) setSelectedProvinceId(parseInt(urlProvinceId));
    if (urlCityId) setSelectedCityId(parseInt(urlCityId));
    if (urlSort) setSortBy(urlSort);
  }, []);

  // 加载分类
  const loadCategories = async () => {
    try {
      const res = await categoryApi.getTree();
      setCategories(res.data || []);
    } catch (error: any) {
      console.error('加载分类失败:', error);
    }
  };

  // 加载省份
  const loadProvinces = async () => {
    try {
      const res = await regionApi.getProvinces();
      setProvinces(res.data || []);
    } catch (error: any) {
      console.error('加载省份失败:', error);
    }
  };

  // 加载城市
  const loadCities = async (provinceId: number) => {
    try {
      const res = await regionApi.getCities(provinceId);
      setCities(res.data || []);
    } catch (error: any) {
      console.error('加载城市失败:', error);
    }
  };

  // 省份改变
  const handleProvinceChange = (provinceId: string) => {
    const id = parseInt(provinceId);
    setSelectedProvinceId(id);
    setSelectedCityId(0);
    setCities([]);
    
    if (id) {
      loadCities(id);
    }
  };

  // 一级分类改变
  const handleCategory1Change = (value: string) => {
    setCategory1(value);
    setCategory2('');
  };

  // 获取二级分类列表
  const getCategory2List = () => {
    if (!category1) return [];
    const cat1 = categories.find(c => c.name === category1);
    return cat1?.children || [];
  };

  // 加载设备列表
  useEffect(() => {
    fetchEquipments();
  }, [page]);

  const fetchEquipments = async () => {
    setLoading(true);
    try {
      const params: any = {
        page,
        pageSize,
      };

      if (keyword) params.keyword = keyword;
      if (category1) params.category1 = category1;
      if (category2) params.category2 = category2;
      if (selectedProvinceId) params.provinceId = selectedProvinceId;
      if (selectedCityId) params.cityId = selectedCityId;
      if (priceMin) params.priceMin = parseFloat(priceMin);
      if (priceMax) params.priceMax = parseFloat(priceMax);
      if (sortBy) params.sort = sortBy;

      console.log('查询参数:', params); // 调试日志

      const res = await equipmentApi.getList(params);
      
      console.log('查询结果:', res.data); // 调试日志
      
      setEquipments(res.data?.list || []);
      setTotal(res.data?.total || 0);
    } catch (error: any) {
      console.error('查询失败:', error); // 调试日志
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  // 搜索
  const handleSearch = () => {
    setPage(1);
    fetchEquipments();
    
    // 更新URL参数
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category1) params.set('category1', category1);
    if (category2) params.set('category2', category2);
    if (selectedProvinceId) params.set('provinceId', selectedProvinceId.toString());
    if (selectedCityId) params.set('cityId', selectedCityId.toString());
    if (sortBy) params.set('sort', sortBy);
    
    router.push(`/equipment?${params.toString()}`);
  };

  // 重置筛选
  const handleReset = () => {
    setKeyword('');
    setCategory1('');
    setCategory2('');
    setSelectedProvinceId(0);
    setSelectedCityId(0);
    setPriceMin('');
    setPriceMax('');
    setSortBy('latest');
    setPage(1);
    router.push('/equipment');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* 筛选栏 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="space-y-4">
            {/* 第一行：关键词搜索 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="搜索设备型号、描述..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                搜索
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2 border rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                重置
              </button>
            </div>

            {/* 第二行：分类和地区 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                value={category1}
                onChange={(e) => handleCategory1Change(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">全部分类</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={category2}
                onChange={(e) => setCategory2(e.target.value)}
                disabled={!category1}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
              >
                <option value="">全部子分类</option>
                {getCategory2List().map((cat) => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedProvinceId || ''}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="">全部省份</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCityId || ''}
                onChange={(e) => setSelectedCityId(parseInt(e.target.value))}
                disabled={!selectedProvinceId}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
              >
                <option value="">全部城市</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 第三行：价格和排序 */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">价格：</span>
                <input
                  type="number"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="最低价"
                  className="w-24 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                <span>-</span>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="最高价"
                  className="w-24 px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-gray-600 dark:text-gray-400">排序：</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="latest">最新发布</option>
                  <option value="price_asc">价格从低到高</option>
                  <option value="price_desc">价格从高到低</option>
                  <option value="views">浏览最多</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 结果统计 */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          共找到 <span className="font-semibold text-blue-600">{total}</span> 个设备
        </div>

        {/* 设备列表 */}
        {loading ? (
          <Loading />
        ) : equipments.length === 0 ? (
          <Empty title="暂无设备" description="试试调整筛选条件" />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                />
              ))}
            </div>

            {/* 分页 */}
            <div className="mt-8">
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
