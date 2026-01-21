# 设备发布模块 - 设计文档

## 架构设计

### 目录结构

```
frontend/src/
├── app/
│   ├── equipment/
│   │   ├── new/
│   │   │   └── page.tsx              # 发布页面
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx          # 编辑页面
│   └── profile/
│       └── equipment/
│           └── page.tsx              # 我的设备页面
├── components/
│   ├── equipment/
│   │   ├── EquipmentForm.tsx         # 设备表单组件
│   │   ├── EquipmentList.tsx         # 设备列表组件
│   │   ├── EquipmentStats.tsx        # 设备统计组件
│   │   └── StatusBadge.tsx           # 状态徽章组件
│   └── ui/
│       ├── Upload.tsx                # 图片上传组件
│       ├── Cascader.tsx              # 级联选择器
│       └── RegionSelector.tsx        # 地区选择器
├── lib/
│   ├── api/endpoints/
│   │   ├── equipment.ts              # 设备API
│   │   ├── upload.ts                 # 上传API
│   │   ├── category.ts               # 分类API
│   │   └── region.ts                 # 地区API
│   ├── store/
│   │   └── equipmentStore.ts         # 设备状态管理
│   └── utils/
│       ├── imageCompress.ts          # 图片压缩工具
│       └── formValidation.ts         # 表单验证工具
└── types/
    └── equipment.ts                  # 设备类型定义
```

## 详细设计

### 1. 设备发布页面设计

#### 1.1 页面布局

```typescript
// app/equipment/new/page.tsx
export default function EquipmentNewPage() {
  return (
    <Container>
      <Breadcrumb items={[
        { label: '首页', href: '/' },
        { label: '发布设备' }
      ]} />
      
      <div className="max-w-4xl mx-auto">
        <h1>发布设备</h1>
        <EquipmentForm mode="create" />
      </div>
    </Container>
  );
}
```

#### 1.2 表单组件设计

```typescript
// components/equipment/EquipmentForm.tsx
interface EquipmentFormProps {
  mode: 'create' | 'edit';
  initialData?: Equipment;
  onSuccess?: () => void;
}

export default function EquipmentForm({ mode, initialData, onSuccess }: EquipmentFormProps) {
  const form = useForm<EquipmentFormData>({
    resolver: zodResolver(equipmentSchema),
    defaultValues: initialData || getDraftData(),
  });

  // 自动保存草稿
  useEffect(() => {
    const subscription = form.watch((data) => {
      debouncedSaveDraft(data);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const onSubmit = async (data: EquipmentFormData) => {
    try {
      if (mode === 'create') {
        await equipmentApi.create(data);
      } else {
        await equipmentApi.update(initialData!.id, data);
      }
      clearDraft();
      showToast({ type: 'success', message: '提交成功，等待审核' });
      onSuccess?.();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* 基本信息 */}
      <Section title="基本信息">
        <Input
          label="设备型号"
          {...form.register('model')}
          error={form.formState.errors.model?.message}
          required
        />
        
        <CategorySelector
          value={[form.watch('category1'), form.watch('category2')]}
          onChange={(values) => {
            form.setValue('category1', values[0]);
            form.setValue('category2', values[1]);
          }}
          error={form.formState.errors.category1?.message}
          required
        />
        
        <Upload
          value={form.watch('images')}
          onChange={(urls) => form.setValue('images', urls)}
          maxCount={9}
          error={form.formState.errors.images?.message}
          required
        />
        
        <Textarea
          label="设备描述"
          {...form.register('description')}
          maxLength={500}
          showCount
        />
        
        <Input
          label="作业能力"
          {...form.register('capacity')}
          placeholder="例如：挖掘深度5米"
        />
      </Section>

      {/* 位置信息 */}
      <Section title="位置信息">
        <RegionSelector
          value={[
            form.watch('province'),
            form.watch('city'),
            form.watch('county')
          ]}
          onChange={(values) => {
            form.setValue('province', values[0]);
            form.setValue('city', values[1]);
            form.setValue('county', values[2]);
          }}
          error={form.formState.errors.province?.message}
          required
        />
        
        <Input
          label="详细地址"
          {...form.register('address')}
          error={form.formState.errors.address?.message}
          required
        />
        
        <MapPicker
          value={{
            latitude: form.watch('latitude'),
            longitude: form.watch('longitude')
          }}
          onChange={(coords) => {
            form.setValue('latitude', coords.latitude);
            form.setValue('longitude', coords.longitude);
          }}
        />
      </Section>

      {/* 价格信息 */}
      <Section title="价格信息">
        <div className="flex gap-4">
          <Input
            label="租赁价格"
            type="number"
            {...form.register('price')}
            error={form.formState.errors.price?.message}
            required
          />
          
          <Radio
            label="价格单位"
            options={[
              { label: '元/天', value: 'day' },
              { label: '元/小时', value: 'hour' }
            ]}
            {...form.register('priceUnit')}
            required
          />
        </div>
      </Section>

      {/* 联系方式 */}
      <Section title="联系方式">
        <Input
          label="联系电话"
          {...form.register('phone')}
          error={form.formState.errors.phone?.message}
          required
        />
        
        <Input
          label="微信号"
          {...form.register('wechat')}
        />
      </Section>

      {/* 可用时间 */}
      <Section title="可用时间（选填）">
        <div className="flex gap-4">
          <DatePicker
            label="开始日期"
            value={form.watch('availableStart')}
            onChange={(date) => form.setValue('availableStart', date)}
          />
          
          <DatePicker
            label="结束日期"
            value={form.watch('availableEnd')}
            onChange={(date) => form.setValue('availableEnd', date)}
          />
        </div>
      </Section>

      {/* 操作按钮 */}
      <div className="flex gap-4 justify-end">
        <Button variant="outline" onClick={() => router.back()}>
          取消
        </Button>
        <Button
          variant="outline"
          onClick={() => saveDraft(form.getValues())}
        >
          保存草稿
        </Button>
        <Button type="submit" loading={form.formState.isSubmitting}>
          提交发布
        </Button>
      </div>
    </form>
  );
}
```

### 2. 我的设备页面设计

#### 2.1 页面布局

```typescript
// app/profile/equipment/page.tsx
export default function MyEquipmentPage() {
  const [status, setStatus] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const { data, loading } = useMyEquipments({ status, page });

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <h1>我的设备</h1>
        <Button href="/equipment/new">
          发布设备
        </Button>
      </div>

      {/* 统计卡片 */}
      <EquipmentStats stats={data?.stats} />

      {/* 状态筛选 */}
      <Tabs
        value={status}
        onChange={setStatus}
        items={[
          { label: '全部', value: undefined },
          { label: '待审核', value: 0 },
          { label: '已发布', value: 1 },
          { label: '已拒绝', value: 2 },
          { label: '已下架', value: 3 },
        ]}
      />

      {/* 设备列表 */}
      <EquipmentList
        equipments={data?.list}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
        onPromote={handlePromote}
      />

      {/* 分页 */}
      <Pagination
        current={page}
        total={data?.total}
        pageSize={20}
        onChange={setPage}
      />
    </Container>
  );
}
```

#### 2.2 设备列表组件

```typescript
// components/equipment/EquipmentList.tsx
interface EquipmentListProps {
  equipments: Equipment[];
  loading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, action: 'online' | 'offline') => void;
  onPromote: (id: string) => void;
}

export default function EquipmentList({
  equipments,
  loading,
  onEdit,
  onDelete,
  onToggleStatus,
  onPromote
}: EquipmentListProps) {
  if (loading) return <Loading />;
  if (!equipments?.length) return <Empty message="暂无设备" />;

  return (
    <div className="space-y-4">
      {equipments.map((equipment) => (
        <Card key={equipment.id} className="flex gap-4">
          {/* 缩略图 */}
          <img
            src={equipment.images[0]}
            alt={equipment.model}
            className="w-32 h-32 object-cover rounded"
          />

          {/* 信息 */}
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3>{equipment.model}</h3>
                <p className="text-gray-600">
                  {equipment.city} {equipment.county}
                </p>
                <p className="text-primary font-bold">
                  ¥{equipment.price}/{equipment.priceUnit === 'day' ? '天' : '小时'}
                </p>
              </div>
              
              <StatusBadge status={equipment.status} />
            </div>

            {/* 统计数据 */}
            <div className="flex gap-4 mt-2 text-sm text-gray-600">
              <span>浏览 {equipment.viewCount}</span>
              <span>联系 {equipment.contactCount}</span>
              <span>收藏 {equipment.favoriteCount}</span>
            </div>

            {/* 拒绝原因 */}
            {equipment.status === 2 && equipment.rejectReason && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 rounded">
                拒绝原因：{equipment.rejectReason}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(equipment.id)}
              >
                编辑
              </Button>
              
              {equipment.status === 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleStatus(equipment.id, 'offline')}
                >
                  下架
                </Button>
              )}
              
              {equipment.status === 3 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onToggleStatus(equipment.id, 'online')}
                >
                  上架
                </Button>
              )}
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPromote(equipment.id)}
              >
                推广
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => onDelete(equipment.id)}
              >
                删除
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 3. 图片上传组件设计

```typescript
// components/ui/Upload.tsx
interface UploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number; // MB
  accept?: string;
  error?: string;
  required?: boolean;
}

export default function Upload({
  value = [],
  onChange,
  maxCount = 9,
  maxSize = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  error,
  required
}: UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});

  const handleUpload = async (files: File[]) => {
    if (value.length + files.length > maxCount) {
      showToast({ type: 'error', message: `最多上传${maxCount}张图片` });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // 验证文件
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`图片大小不能超过${maxSize}MB`);
        }

        // 压缩图片
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
        });

        // 上传
        const url = await uploadApi.upload(compressed, (percent) => {
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        });

        return url;
      });

      const urls = await Promise.all(uploadPromises);
      onChange?.([...value, ...urls]);
      showToast({ type: 'success', message: '上传成功' });
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setUploading(false);
      setProgress({});
    }
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange?.(newValue);
  };

  const handleSort = (oldIndex: number, newIndex: number) => {
    const newValue = [...value];
    const [removed] = newValue.splice(oldIndex, 1);
    newValue.splice(newIndex, 0, removed);
    onChange?.(newValue);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {/* 已上传图片 */}
        {value.map((url, index) => (
          <div key={url} className="relative group">
            <img
              src={url}
              alt=""
              className="w-full h-32 object-cover rounded"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button onClick={() => handleRemove(index)}>删除</button>
              <button onClick={() => previewImage(url)}>预览</button>
            </div>
          </div>
        ))}

        {/* 上传按钮 */}
        {value.length < maxCount && (
          <label className="w-full h-32 border-2 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-primary">
            <input
              type="file"
              multiple
              accept={accept}
              onChange={(e) => handleUpload(Array.from(e.target.files || []))}
              className="hidden"
            />
            <div className="text-center">
              <div className="text-2xl">+</div>
              <div className="text-sm text-gray-600">上传图片</div>
            </div>
          </label>
        )}
      </div>

      {/* 上传进度 */}
      {uploading && (
        <div className="mt-2">
          {Object.entries(progress).map(([name, percent]) => (
            <div key={name} className="flex items-center gap-2">
              <span className="text-sm">{name}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded">
                <div
                  className="h-full bg-primary rounded"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-sm">{percent}%</span>
            </div>
          ))}
        </div>
      )}

      {/* 错误提示 */}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      {/* 提示信息 */}
      <p className="text-gray-600 text-sm mt-1">
        支持jpg/png/webp格式，单张最大{maxSize}MB，最多{maxCount}张
      </p>
    </div>
  );
}
```

### 4. 地区选择器设计

```typescript
// components/ui/RegionSelector.tsx
interface RegionSelectorProps {
  value?: [string, string, string];
  onChange?: (value: [string, string, string]) => void;
  error?: string;
  required?: boolean;
}

export default function RegionSelector({
  value = ['', '', ''],
  onChange,
  error,
  required
}: RegionSelectorProps) {
  const [provinces, setProvinces] = useState<Region[]>([]);
  const [cities, setCities] = useState<Region[]>([]);
  const [counties, setCounties] = useState<Region[]>([]);

  // 加载省份
  useEffect(() => {
    regionApi.getProvinces().then(setProvinces);
  }, []);

  // 加载城市
  useEffect(() => {
    if (value[0]) {
      const province = provinces.find((p) => p.name === value[0]);
      if (province) {
        regionApi.getCities(province.id).then(setCities);
      }
    } else {
      setCities([]);
      setCounties([]);
    }
  }, [value[0], provinces]);

  // 加载区县
  useEffect(() => {
    if (value[1]) {
      const city = cities.find((c) => c.name === value[1]);
      if (city) {
        regionApi.getCounties(city.id).then(setCounties);
      }
    } else {
      setCounties([]);
    }
  }, [value[1], cities]);

  const handleProvinceChange = (province: string) => {
    onChange?.([province, '', '']);
  };

  const handleCityChange = (city: string) => {
    onChange?.([value[0], city, '']);
  };

  const handleCountyChange = (county: string) => {
    onChange?.([value[0], value[1], county]);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <Select
          placeholder="请选择省份"
          value={value[0]}
          onChange={handleProvinceChange}
          options={provinces.map((p) => ({ label: p.name, value: p.name }))}
          required={required}
        />
        
        <Select
          placeholder="请选择城市"
          value={value[1]}
          onChange={handleCityChange}
          options={cities.map((c) => ({ label: c.name, value: c.name }))}
          disabled={!value[0]}
          required={required}
        />
        
        <Select
          placeholder="请选择区县"
          value={value[2]}
          onChange={handleCountyChange}
          options={counties.map((c) => ({ label: c.name, value: c.name }))}
          disabled={!value[1]}
          required={required}
        />
      </div>
      
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
```

### 5. 表单验证Schema

```typescript
// lib/utils/formValidation.ts
import { z } from 'zod';

export const equipmentSchema = z.object({
  model: z.string()
    .min(1, '请输入设备型号')
    .max(100, '设备型号最多100字符'),
  
  category1: z.string().min(1, '请选择设备分类'),
  category2: z.string().min(1, '请选择设备分类'),
  
  images: z.array(z.string())
    .min(1, '请至少上传1张图片')
    .max(9, '最多上传9张图片'),
  
  description: z.string()
    .max(500, '描述最多500字符')
    .optional(),
  
  capacity: z.string()
    .max(100, '作业能力最多100字符')
    .optional(),
  
  province: z.string().min(1, '请选择省份'),
  city: z.string().min(1, '请选择城市'),
  county: z.string().min(1, '请选择区县'),
  
  address: z.string()
    .min(1, '请输入详细地址')
    .max(200, '地址最多200字符'),
  
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  
  price: z.number()
    .min(0.01, '价格必须大于0')
    .max(999999.99, '价格不能超过999999.99'),
  
  priceUnit: z.enum(['day', 'hour']),
  
  phone: z.string()
    .regex(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  
  wechat: z.string()
    .max(50, '微信号最多50字符')
    .optional(),
  
  availableStart: z.date().optional(),
  availableEnd: z.date().optional(),
}).refine((data) => {
  if (data.availableStart && data.availableEnd) {
    return data.availableEnd >= data.availableStart;
  }
  return true;
}, {
  message: '结束日期不能早于开始日期',
  path: ['availableEnd'],
});
```

### 6. 草稿管理

```typescript
// lib/store/equipmentStore.ts
interface EquipmentStore {
  draft: EquipmentFormData | null;
  saveDraft: (data: EquipmentFormData) => void;
  getDraft: () => EquipmentFormData | null;
  clearDraft: () => void;
}

export const useEquipmentStore = create<EquipmentStore>()(
  persist(
    (set, get) => ({
      draft: null,
      
      saveDraft: (data) => {
        set({ draft: { ...data, _savedAt: Date.now() } });
      },
      
      getDraft: () => {
        const draft = get().draft;
        if (!draft) return null;
        
        // 检查是否过期（7天）
        const savedAt = draft._savedAt || 0;
        const now = Date.now();
        const days = (now - savedAt) / (1000 * 60 * 60 * 24);
        
        if (days > 7) {
          set({ draft: null });
          return null;
        }
        
        return draft;
      },
      
      clearDraft: () => {
        set({ draft: null });
      },
    }),
    { name: 'equipment-draft' }
  )
);
```

## 数据流设计

### 发布流程

```
用户填写表单 →
自动保存草稿（防抖2秒） →
点击提交 →
表单验证 →
调用API →
清除草稿 →
显示成功提示 →
跳转到我的设备
```

### 编辑流程

```
加载设备数据 →
填充表单 →
用户修改 →
自动保存草稿 →
点击提交 →
表单验证 →
调用API →
清除草稿 →
显示成功提示 →
返回我的设备
```

### 图片上传流程

```
选择图片 →
验证格式和大小 →
客户端压缩 →
上传到服务器 →
显示进度 →
返回URL →
更新表单
```

## 性能优化

### 1. 图片优化
- 客户端压缩减少上传时间
- 懒加载图片预览
- 使用WebP格式

### 2. 数据缓存
- 分类数据缓存（1小时）
- 地区数据缓存（1天）
- 草稿本地存储

### 3. 表单优化
- 防抖保存草稿
- 按需验证字段
- 异步验证（手机号重复等）

## 错误处理

### 1. 上传错误
- 文件格式错误：提示支持的格式
- 文件过大：提示压缩或选择其他图片
- 网络错误：提示重试

### 2. 表单错误
- 验证错误：字段下方显示
- 提交错误：Toast提示
- 网络错误：Toast提示并保留表单数据

### 3. 权限错误
- 未登录：跳转登录页
- 无权限：提示并返回
- 限额超出：提示升级或等待
