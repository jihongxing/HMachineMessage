'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { equipmentApi } from '@/lib/api';
import { useAppStore, useUserStore } from '@/lib/store';
import Upload from '@/components/ui/Upload';
import RegionSelector from '@/components/ui/RegionSelector';
import CategorySelector from '@/components/ui/CategorySelector';
import { getPriceUnitsByCategory, getPriceUnitText, PriceUnitType } from '@/lib/utils/priceUnit';

export default function EquipmentEditPage() {
  const router = useRouter();
  const params = useParams();
  const equipmentId = params.id as string;
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();

  const [formData, setFormData] = useState({
    model: '',
    category1: '',
    category2: '',
    images: [] as string[],
    description: '',
    capacity: '',
    provinceId: 0,
    cityId: 0,
    countyId: 0,
    address: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    price: '',
    priceUnit: 'day' as PriceUnitType,
    phone: '',
    wechat: '',
    availableStart: '',
    availableEnd: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // 根据分类动态获取可用的价格单位
  const availablePriceUnits = useMemo(() => {
    if (!formData.category1 || !formData.category2) {
      return ['hour', 'day', 'shift'] as PriceUnitType[];
    }
    return getPriceUnitsByCategory(formData.category1, formData.category2);
  }, [formData.category1, formData.category2]);

  // 检查登录状态
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login');
    }
  }, [isLoggedIn, router]);

  // 加载设备数据
  useEffect(() => {
    if (equipmentId) {
      equipmentApi.getDetail(equipmentId)
        .then((data: any) => {
          const equipment = data.data;
          setFormData({
            model: equipment.model,
            category1: equipment.category1,
            category2: equipment.category2,
            images: equipment.images,
            description: equipment.description || '',
            capacity: equipment.capacity || '',
            provinceId: equipment.provinceId,
            cityId: equipment.cityId,
            countyId: equipment.countyId,
            address: equipment.address,
            latitude: equipment.latitude,
            longitude: equipment.longitude,
            price: equipment.price.toString(),
            priceUnit: equipment.priceUnit,
            phone: equipment.phone,
            wechat: equipment.wechat || '',
            availableStart: equipment.availableStart || '',
            availableEnd: equipment.availableEnd || '',
          });
        })
        .catch((error: any) => {
          showToast({ type: 'error', message: error.message });
          router.push('/profile/equipment');
        })
        .finally(() => setLoadingData(false));
    }
  }, [equipmentId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.model) newErrors.model = '请输入设备型号';
    if (!formData.category1) newErrors.category1 = '请选择设备分类';
    if (!formData.category2) newErrors.category2 = '请选择设备分类';
    if (formData.images.length === 0) newErrors.images = '请至少上传1张图片';
    if (!formData.provinceId) newErrors.province = '请选择省份';
    if (!formData.cityId) newErrors.city = '请选择城市';
    if (!formData.countyId) newErrors.county = '请选择区县';
    if (!formData.address) newErrors.address = '请输入详细地址';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = '请输入正确的价格';
    if (!formData.phone || !/^1[3-9]\d{9}$/.test(formData.phone)) newErrors.phone = '请输入正确的手机号';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast({ type: 'error', message: '请填写完整信息' });
      return;
    }

    setLoading(true);
    try {
      await equipmentApi.update(equipmentId, {
        ...formData,
        price: parseFloat(formData.price),
      });

      showToast({ type: 'success', message: '更新成功，等待审核' });
      router.push('/profile/equipment');
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">加载中...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">编辑设备</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">基本信息</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                设备型号 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入设备型号"
                maxLength={100}
              />
              {errors.model && <p className="text-red-600 text-sm mt-1">{errors.model}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                设备分类 <span className="text-red-600">*</span>
              </label>
              <CategorySelector
                value={[formData.category1, formData.category2]}
                onChange={(value) => setFormData({ ...formData, category1: value[0], category2: value[1] })}
                error={errors.category1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                设备图片 <span className="text-red-600">*</span>
              </label>
              <Upload
                value={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                maxCount={9}
                error={errors.images}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">设备描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入设备描述"
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-600 mt-1">{formData.description.length}/500</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">作业能力</label>
              <input
                type="text"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：挖掘深度5米"
                maxLength={100}
              />
            </div>
          </div>
        </div>

        {/* 位置信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">位置信息</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                省市区 <span className="text-red-600">*</span>
              </label>
              <RegionSelector
                value={{ provinceId: formData.provinceId, cityId: formData.cityId, countyId: formData.countyId }}
                onChange={(value) => setFormData({ ...formData, provinceId: value.provinceId, cityId: value.cityId, countyId: value.countyId })}
                error={errors.province}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                详细地址 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入详细地址"
                maxLength={200}
              />
              {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
            </div>
          </div>
        </div>

        {/* 价格信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">价格信息</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                租赁价格 <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入价格"
                min="0"
                step="0.01"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                价格单位 <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.priceUnit}
                onChange={(e) => setFormData({ ...formData, priceUnit: e.target.value as PriceUnitType })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {availablePriceUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {getPriceUnitText(unit)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                根据设备类型自动匹配可用单位
              </p>
            </div>
          </div>
        </div>

        {/* 联系方式 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">联系方式</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                联系电话 <span className="text-red-600">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入手机号"
                maxLength={11}
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">微信号</label>
              <input
                type="text"
                value={formData.wechat}
                onChange={(e) => setFormData({ ...formData, wechat: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入微信号"
                maxLength={50}
              />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border rounded hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
}
