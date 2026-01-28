'use client';

import { useState, useEffect } from 'react';
import { categoryApi } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  children?: Category[];
}

interface CategorySelectorProps {
  value?: [string, string];
  onChange?: (value: [string, string]) => void;
  error?: string;
  required?: boolean;
}

export default function CategorySelector({
  value = ['', ''],
  onChange,
  error,
  required
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // 加载分类树
  useEffect(() => {
    setLoading(true);
    categoryApi.getTree()
      .then((data: any) => setCategories(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  // 加载二级分类
  useEffect(() => {
    if (value[0]) {
      const category = categories.find((c) => c.name === value[0]);
      if (category?.children) {
        setSubCategories(category.children);
      }
    } else {
      setSubCategories([]);
    }
  }, [value[0], categories]);

  const handleCategory1Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.([e.target.value, '']);
  };

  const handleCategory2Change = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange?.([value[0], e.target.value]);
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
        <select
          value={value[0]}
          onChange={handleCategory1Change}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          required={required}
          disabled={loading}
        >
          <option value="">请选择一级分类</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={value[1]}
          onChange={handleCategory2Change}
          className="w-full px-3 py-2 border dark:border-gray-600 dark:bg-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
          required={required}
          disabled={!value[0]}
        >
          <option value="">请选择二级分类</option>
          {subCategories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
