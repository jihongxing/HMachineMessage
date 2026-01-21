# 前端核心基础设施 - 设计文档

## 架构设计

### 目录结构

```
frontend/src/
├── lib/
│   ├── api/
│   │   ├── client.ts          # Axios实例配置
│   │   ├── interceptors.ts    # 拦截器
│   │   ├── endpoints/         # API端点定义
│   │   │   ├── auth.ts
│   │   │   ├── equipment.ts
│   │   │   ├── order.ts
│   │   │   └── user.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── userStore.ts       # 用户状态
│   │   ├── appStore.ts        # 应用状态
│   │   ├── equipmentStore.ts  # 设备状态
│   │   └── index.ts
│   ├── utils/
│   │   ├── format.ts          # 格式化工具
│   │   ├── validate.ts        # 验证工具
│   │   ├── storage.ts         # 存储工具
│   │   └── helpers.ts         # 其他工具
│   └── theme.ts               # 主题管理（已存在）
├── components/
│   ├── ui/                    # 通用UI组件
│   │   ├── Loading.tsx
│   │   ├── Toast.tsx
│   │   ├── Modal.tsx
│   │   ├── Empty.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Upload.tsx
│   │   ├── Cascader.tsx
│   │   ├── Pagination.tsx
│   │   └── index.ts
│   └── ...                    # 业务组件
└── types/
    ├── api.ts                 # API类型定义
    └── common.ts              # 通用类型定义
```

## 详细设计

### 1. API客户端设计

#### 1.1 Axios实例配置

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
```

#### 1.2 请求拦截器

```typescript
// lib/api/interceptors.ts
apiClient.interceptors.request.use(
  (config) => {
    // 添加Token
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

#### 1.3 响应拦截器

```typescript
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期，尝试刷新
      const refreshed = await refreshToken();
      if (refreshed) {
        return apiClient.request(error.config);
      }
      // 刷新失败，跳转登录
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
```

#### 1.4 API端点封装

```typescript
// lib/api/endpoints/auth.ts
export const authApi = {
  login: (data: LoginDto) => 
    apiClient.post('/auth/login', data),
  
  register: (data: RegisterDto) => 
    apiClient.post('/auth/register', data),
  
  sendSms: (phone: string) => 
    apiClient.post('/auth/sms/send', { phone }),
};
```

### 2. 状态管理设计

#### 2.1 用户状态Store

```typescript
// lib/store/userStore.ts
interface UserState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  initFromStorage: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      
      login: (token, user) => {
        localStorage.setItem('access_token', token);
        set({ token, user, isLoggedIn: true });
      },
      
      logout: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null, isLoggedIn: false });
      },
      
      updateUser: (userData) => 
        set((state) => ({ 
          user: { ...state.user!, ...userData } 
        })),
      
      initFromStorage: () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          // 验证token并获取用户信息
          fetchUserProfile().then((user) => {
            set({ token, user, isLoggedIn: true });
          });
        }
      },
    }),
    { name: 'user-storage' }
  )
);
```

#### 2.2 应用状态Store

```typescript
// lib/store/appStore.ts
interface AppState {
  loading: boolean;
  toasts: Toast[];
  modal: ModalState | null;
  setLoading: (loading: boolean) => void;
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showModal: (modal: ModalState) => void;
  closeModal: () => void;
}
```

#### 2.3 设备状态Store

```typescript
// lib/store/equipmentStore.ts
interface EquipmentState {
  filters: SearchFilters;
  equipments: Equipment[];
  pagination: PaginationInfo;
  draft: EquipmentDraft | null;
  setFilters: (filters: Partial<SearchFilters>) => void;
  setEquipments: (equipments: Equipment[]) => void;
  saveDraft: (draft: EquipmentDraft) => void;
  clearDraft: () => void;
}
```

### 3. 通用组件设计

#### 3.1 Toast组件

```typescript
// components/ui/Toast.tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose: () => void;
}

// 使用方式
const { showToast } = useAppStore();
showToast({ type: 'success', message: '操作成功' });
```

#### 3.2 Modal组件

```typescript
// components/ui/Modal.tsx
interface ModalProps {
  title: string;
  content: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}
```

#### 3.3 Upload组件

```typescript
// components/ui/Upload.tsx
interface UploadProps {
  accept?: string;
  maxSize?: number;
  maxCount?: number;
  value?: string[];
  onChange?: (urls: string[]) => void;
  onError?: (error: string) => void;
}
```

#### 3.4 Cascader组件

```typescript
// components/ui/Cascader.tsx
interface CascaderProps {
  options: CascaderOption[];
  value?: string[];
  onChange?: (value: string[]) => void;
  placeholder?: string;
  loadData?: (selectedOptions: CascaderOption[]) => Promise<void>;
}
```

### 4. 工具函数设计

#### 4.1 格式化工具

```typescript
// lib/utils/format.ts
export const formatDate = (date: Date | string, format?: string) => string;
export const formatMoney = (amount: number) => string;
export const formatPhone = (phone: string) => string;
export const formatDistance = (meters: number) => string;
```

#### 4.2 验证工具

```typescript
// lib/utils/validate.ts
export const isValidPhone = (phone: string) => boolean;
export const isValidPassword = (password: string) => {
  strength: 'weak' | 'medium' | 'strong';
  valid: boolean;
};
export const isValidIdCard = (idCard: string) => boolean;
```

#### 4.3 存储工具

```typescript
// lib/utils/storage.ts
export const storage = {
  get: <T>(key: string, defaultValue?: T) => T | null;
  set: (key: string, value: any) => void;
  remove: (key: string) => void;
  clear: () => void;
};
```

## 数据流设计

### 登录流程

```
用户输入 → authApi.login() → 
获取Token → userStore.login() → 
存储Token → 跳转首页 → 
自动获取用户信息
```

### API请求流程

```
组件调用API → 
请求拦截器添加Token → 
发送请求 → 
响应拦截器处理 → 
返回数据/错误处理
```

### 状态更新流程

```
用户操作 → 
调用Store方法 → 
更新状态 → 
组件自动重渲染
```

## 错误处理策略

### API错误分类

1. **网络错误**：显示"网络连接失败"
2. **401错误**：自动刷新Token或跳转登录
3. **403错误**：显示"无权限访问"
4. **404错误**：显示"资源不存在"
5. **500错误**：显示"服务器错误"
6. **业务错误**：显示后端返回的错误信息

### 错误显示方式

- 全局错误：Toast提示
- 表单错误：字段下方显示
- 页面错误：Empty组件显示

## 性能优化

### 1. 请求优化
- 相同请求去重
- 请求取消机制
- 响应数据缓存

### 2. 状态优化
- 使用shallow比较
- 按需订阅状态
- 避免不必要的重渲染

### 3. 组件优化
- React.memo包裹
- useMemo/useCallback使用
- 懒加载大组件

## 安全设计

### 1. Token管理
- HttpOnly Cookie存储（可选）
- Token自动刷新
- 过期自动登出

### 2. XSS防护
- 输入内容转义
- 使用dangerouslySetInnerHTML时过滤

### 3. CSRF防护
- 使用CSRF Token（如需要）

## 测试策略

### 1. 单元测试
- 工具函数测试
- Store逻辑测试

### 2. 组件测试
- UI组件快照测试
- 交互行为测试

### 3. 集成测试
- API调用测试
- 状态流转测试
