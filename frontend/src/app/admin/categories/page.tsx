'use client';

import { useEffect, useState } from 'react';
import { categoryApi, adminApi } from '@/lib/api';
import { useAppStore } from '@/lib/store';
import { Loading, Empty } from '@/components/ui';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  sort: number;
  isActive: boolean;
  children: Category[];
}

export default function CategoriesPage() {
  const { showToast } = useAppStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [parentId, setParentId] = useState<number | null>(null);

  // 表单数据
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon: '',
    sort: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryApi.getTree();
      setCategories(res.data || []);
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '加载失败' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', icon: '', sort: 0 });
    setEditingId(null);
    setParentId(null);
    setShowAddForm(false);
  };

  const handleAdd = (pId: number | null = null) => {
    resetForm();
    setParentId(pId);
    setShowAddForm(true);
  };

  const handleEdit = (cat: Category) => {
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      icon: cat.icon || '',
      sort: cat.sort,
    });
    setEditingId(cat.id);
    setShowAddForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.slug) {
      showToast({ type: 'error', message: '名称和标识不能为空' });
      return;
    }

    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, formData);
        showToast({ type: 'success', message: '更新成功' });
      } else {
        await adminApi.createCategory({
          ...formData,
          parentId: parentId || undefined,
        });
        showToast({ type: 'success', message: '创建成功' });
      }
      resetForm();
      loadCategories();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '操作失败' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除该分类？')) return;
    
    try {
      await adminApi.deleteCategory(id);
      showToast({ type: 'success', message: '删除成功' });
      loadCategories();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '删除失败' });
    }
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await adminApi.updateCategory(cat.id, { isActive: !cat.isActive });
      showToast({ type: 'success', message: cat.isActive ? '已禁用' : '已启用' });
      loadCategories();
    } catch (error: any) {
      showToast({ type: 'error', message: error.message || '操作失败' });
    }
  };

  if (loading) {
    return <div className="container py-12 text-center"><Loading size="lg" /></div>;
  }

  return (
    <div className="container py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold">分类管理</h1>
        <button onClick={() => handleAdd(null)} className="btn btn-primary">
          + 添加一级分类
        </button>
      </div>

      {/* 添加/编辑表单 */}
      {showAddForm && (
        <div className="card mb-6">
          <h3 className="font-bold mb-4">
            {editingId ? '编辑分类' : parentId ? '添加子分类' : '添加一级分类'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">名称 *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="如：挖掘机"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">标识 *</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="如：excavator"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">图标</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="图标URL或emoji"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">排序</label>
              <input
                type="number"
                value={formData.sort}
                onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">描述</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSubmit} className="btn btn-primary">
              {editingId ? '保存' : '添加'}
            </button>
            <button onClick={resetForm} className="btn">取消</button>
          </div>
        </div>
      )}

      {/* 分类列表 */}
      {categories.length === 0 ? (
        <Empty title="暂无分类" />
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {cat.icon && <span className="text-2xl">{cat.icon}</span>}
                  <div>
                    <div className="font-bold">{cat.name}</div>
                    <div className="text-sm text-gray-500">{cat.slug}</div>
                  </div>
                  {!cat.isActive && (
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">已禁用</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAdd(cat.id)} className="btn btn-sm">+ 子分类</button>
                  <button onClick={() => handleEdit(cat)} className="btn btn-sm">编辑</button>
                  <button onClick={() => handleToggleActive(cat)} className="btn btn-sm">
                    {cat.isActive ? '禁用' : '启用'}
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="btn btn-sm text-red-600">删除</button>
                </div>
              </div>

              {/* 子分类 */}
              {cat.children.length > 0 && (
                <div className="mt-4 pl-8 border-l-2 border-gray-200 dark:border-gray-700 space-y-2">
                  {cat.children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        {child.icon && <span>{child.icon}</span>}
                        <span>{child.name}</span>
                        <span className="text-sm text-gray-500">({child.slug})</span>
                        {!child.isActive && (
                          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded">已禁用</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(child)} className="btn btn-sm">编辑</button>
                        <button onClick={() => handleToggleActive(child)} className="btn btn-sm">
                          {child.isActive ? '禁用' : '启用'}
                        </button>
                        <button onClick={() => handleDelete(child.id)} className="btn btn-sm text-red-600">删除</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
