'use client';

import { useState, useEffect } from 'react';
import { regionApi } from '@/lib/api';

interface Region {
  id: number;
  name: string;
}

interface RegionSelectorProps {
  value?: { provinceId: number; cityId: number; countyId: number };
  onChange?: (value: { provinceId: number; cityId: number; countyId: number }) => void;
  error?: string;
  required?: boolean;
}

export default function RegionSelector({
  value,
  onChange,
  error,
  required
}: RegionSelectorProps) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [counties, setCounties] = useState<Region[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载省份
  useEffect(() => {
    setLoading(true);
    regionApi.getProvinces()
      .then((data: any) => setProvinces(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  // 加载城市
  useEffect(() => {
    if (value?.provinceId) {
      regionApi.getCities(value.provinceId)
        .then((data: any) => setCities(data.data || []));
    } else {
      setCities([]);
      setCounties([]);
    }
  }, [value?.provinceId]);

  // 加载区县
  useEffect(() => {
    if (value?.cityId) {
      regionApi.getCounties(value.cityId)
        .then((data: any) => setCounties(data.data || []));
    } else {
      setCounties([]);
    }
  }, [value?.cityId]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = parseInt(e.target.value);
    onChange?.({ provinceId, cityId: 0, countyId: 0 });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = parseInt(e.target.value);
    onChange?.({ provinceId: value!.provinceId, cityId, countyId: 0 });
  };

  const handleCountyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countyId = parseInt(e.target.value);
    onChange?.({ provinceId: value!.provinceId, cityId: value!.cityId, countyId });
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4">
        <select
          value={value?.provinceId || ''}
          onChange={handleProvinceChange}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          required={required}
          disabled={loading}
        >
          <option value="">请选择省份</option>
          {provinces.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={value?.cityId || ''}
          onChange={handleCityChange}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          required={required}
          disabled={!value?.provinceId}
        >
          <option value="">请选择城市</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={value?.countyId || ''}
          onChange={handleCountyChange}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          required={required}
          disabled={!value?.cityId}
        >
          <option value="">请选择区县</option>
          {counties.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
