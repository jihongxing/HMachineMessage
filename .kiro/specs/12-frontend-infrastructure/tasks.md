# 前端核心基础设施 - 任务清单

## Phase 1: API客户端 (优先级: P0)

### 1.1 基础配置
- [ ] 创建 `lib/api/client.ts` - Axios实例配置
- [ ] 创建 `lib/api/interceptors.ts` - 请求/响应拦截器
- [ ] 添加环境变量 `NEXT_PUBLIC_API_URL`
- [ ] 实现Token自动添加逻辑
- [ ] 实现401自动跳转登录

### 1.2 API端点封装
- [ ] 创建 `lib/api/endpoints/auth.ts` - 认证API
  - [ ] login - 登录
  - [ ] register - 注册
  - [ ] sendSms - 发送验证码
  - [ ] resetPassword - 重置密码
  - [ ] refreshToken - 刷新Token

- [ ] 创建 `lib/api/endpoints/user.ts` - 用户API
  - [ ] getProfile - 获取个人信息
  - [ ] updateProfile - 更新个人信息
  - [ ] changePassword - 修改密码
  - [ ] changePhone - 更换手机号

- [ ] 创建 `lib/api/endpoints/equipment.ts` - 设备API
  - [ ] getList - 设备列表
  - [ ] getDetail - 设备详情
  - [ ] create - 发布设备
  - [ ] update - 更新设备
  - [ ] delete - 删除设备
  - [ ] getMyEquipments - 我的设备

- [ ] 创建 `lib/api/endpoints/category.ts` - 分类API
  - [ ] getTree - 分类树

- [ ] 创建 `lib/api/endpoints/region.ts` - 地区API
  - [ ] getProvinces - 省份列表
  - [ ] getCities - 城市列表
  - [ ] getCounties - 区县列表

- [ ] 创建 `lib/api/endpoints/upload.ts` - 上传API
  - [ ] getToken - 获取上传凭证
  - [ ] upload - 上传文件
  - [ ] delete - 删除文件

- [ ] 创建 `lib/api/endpoints/order.ts` - 订单API
  - [ ] create - 创建订单
  - [ ] getList - 订单列表
  - [ ] getDetail - 订单详情
  - [ ] pay - 支付订单

- [ ] 创建 `lib/api/endpoints/favorite.ts` - 收藏API
  - [ ] add - 添加收藏
  - [ ] remove - 取消收藏
  - [ ] getList - 收藏列表

- [ ] 创建 `lib/api/endpoints/review.ts` - 评价API
  - [ ] create - 发布评价
  - [ ] getList - 评价列表

- [ ] 创建 `lib/api/endpoints/notification.ts` - 通知API
  - [ ] getList - 通知列表
  - [ ] markRead - 标记已读
  - [ ] getUnreadCount - 未读数量

- [ ] 创建 `lib/api/index.ts` - 统一导出

### 1.3 错误处理
- [ ] 实现统一错误处理函数
- [ ] 实现错误码映射
- [ ] 实现Toast错误提示集成

## Phase 2: 状态管理 (优先级: P0)

### 2.1 用户状态Store
- [ ] 创建 `lib/store/userStore.ts`
- [ ] 定义User类型
- [ ] 实现login方法
- [ ] 实现logout方法
- [ ] 实现updateUser方法
- [ ] 实现Token持久化
- [ ] 实现initFromStorage方法
- [ ] 集成到ClientLayout

### 2.2 应用状态Store
- [ ] 创建 `lib/store/appStore.ts`
- [ ] 实现loading状态管理
- [ ] 实现Toast队列管理
- [ ] 实现Modal状态管理
- [ ] 整合现有theme状态

### 2.3 设备状态Store
- [ ] 创建 `lib/store/equipmentStore.ts`
- [ ] 实现搜索条件管理
- [ ] 实现设备列表缓存
- [ ] 实现分页信息管理
- [ ] 实现草稿保存/恢复

### 2.4 导出配置
- [ ] 创建 `lib/store/index.ts` - 统一导出

## Phase 3: 通用组件 (优先级: P0)

### 3.1 反馈组件
- [ ] 创建 `components/ui/Loading.tsx`
  - [ ] 全局Loading
  - [ ] 局部Loading
  - [ ] 按钮Loading

- [ ] 创建 `components/ui/Toast.tsx`
  - [ ] 成功提示
  - [ ] 错误提示
  - [ ] 警告提示
  - [ ] 信息提示
  - [ ] 自动消失
  - [ ] 队列管理

- [ ] 创建 `components/ui/Modal.tsx`
  - [ ] 确认对话框
  - [ ] 提示对话框
  - [ ] 自定义内容对话框
  - [ ] 关闭动画

- [ ] 创建 `components/ui/Empty.tsx`
  - [ ] 空数据状态
  - [ ] 错误状态
  - [ ] 自定义图标和文案

### 3.2 表单组件
- [ ] 创建 `components/ui/Input.tsx`
  - [ ] 文本输入
  - [ ] 数字输入
  - [ ] 密码输入
  - [ ] 错误提示
  - [ ] 前缀/后缀图标

- [ ] 创建 `components/ui/Textarea.tsx`
  - [ ] 多行文本
  - [ ] 字数统计
  - [ ] 自动高度

- [ ] 创建 `components/ui/Select.tsx`
  - [ ] 单选下拉
  - [ ] 多选下拉
  - [ ] 搜索功能
  - [ ] 远程搜索

- [ ] 创建 `components/ui/Checkbox.tsx`
  - [ ] 单个复选框
  - [ ] 复选框组

- [ ] 创建 `components/ui/Radio.tsx`
  - [ ] 单选按钮
  - [ ] 单选按钮组

- [ ] 创建 `components/ui/Upload.tsx`
  - [ ] 图片上传
  - [ ] 文件上传
  - [ ] 拖拽上传
  - [ ] 预览功能
  - [ ] 删除功能
  - [ ] 上传进度
  - [ ] 图片压缩

- [ ] 创建 `components/ui/Cascader.tsx`
  - [ ] 级联选择
  - [ ] 懒加载
  - [ ] 搜索功能

### 3.3 展示组件
- [ ] 创建 `components/ui/Card.tsx`
- [ ] 创建 `components/ui/Tag.tsx`
- [ ] 创建 `components/ui/Badge.tsx`
- [ ] 创建 `components/ui/Avatar.tsx`
- [ ] 创建 `components/ui/Pagination.tsx`
- [ ] 创建 `components/ui/Tabs.tsx`
- [ ] 创建 `components/ui/Collapse.tsx`

### 3.4 布局组件
- [ ] 创建 `components/ui/Container.tsx`
- [ ] 创建 `components/ui/Grid.tsx`
- [ ] 创建 `components/ui/Divider.tsx`

### 3.5 导出配置
- [ ] 创建 `components/ui/index.ts` - 统一导出

## Phase 4: 工具函数 (优先级: P1)

### 4.1 格式化工具
- [ ] 创建 `lib/utils/format.ts`
- [ ] formatDate - 日期格式化
- [ ] formatMoney - 金额格式化
- [ ] formatPhone - 手机号格式化
- [ ] formatDistance - 距离格式化
- [ ] formatFileSize - 文件大小格式化

### 4.2 验证工具
- [ ] 创建 `lib/utils/validate.ts`
- [ ] isValidPhone - 手机号验证
- [ ] isValidPassword - 密码强度验证
- [ ] isValidIdCard - 身份证验证
- [ ] isValidEmail - 邮箱验证
- [ ] isValidUrl - URL验证

### 4.3 存储工具
- [ ] 创建 `lib/utils/storage.ts`
- [ ] localStorage封装
- [ ] sessionStorage封装
- [ ] Cookie操作

### 4.4 其他工具
- [ ] 创建 `lib/utils/helpers.ts`
- [ ] debounce - 防抖
- [ ] throttle - 节流
- [ ] deepClone - 深拷贝
- [ ] parseQuery - URL参数解析
- [ ] downloadFile - 文件下载

### 4.5 导出配置
- [ ] 创建 `lib/utils/index.ts` - 统一导出

## Phase 5: 类型定义 (优先级: P0)

### 5.1 API类型
- [ ] 创建 `types/api.ts`
- [ ] ApiResponse - 统一响应格式
- [ ] PaginationParams - 分页参数
- [ ] PaginationResponse - 分页响应
- [ ] LoginDto - 登录DTO
- [ ] RegisterDto - 注册DTO
- [ ] 其他DTO类型

### 5.2 通用类型
- [ ] 创建 `types/common.ts`
- [ ] User - 用户类型
- [ ] Equipment - 设备类型
- [ ] Category - 分类类型
- [ ] Region - 地区类型
- [ ] Order - 订单类型
- [ ] Toast - Toast类型
- [ ] Modal - Modal类型

## Phase 6: 集成测试 (优先级: P1)

### 6.1 API测试
- [ ] 测试登录流程
- [ ] 测试Token刷新
- [ ] 测试401跳转
- [ ] 测试错误处理

### 6.2 Store测试
- [ ] 测试用户登录/登出
- [ ] 测试状态持久化
- [ ] 测试Toast队列
- [ ] 测试Modal状态

### 6.3 组件测试
- [ ] 测试Toast显示/隐藏
- [ ] 测试Modal打开/关闭
- [ ] 测试Upload上传流程
- [ ] 测试Cascader级联选择

## Phase 7: 文档和优化 (优先级: P2)

### 7.1 文档
- [ ] API使用文档
- [ ] Store使用文档
- [ ] 组件使用文档
- [ ] 工具函数文档

### 7.2 优化
- [ ] 请求去重
- [ ] 响应缓存
- [ ] 组件懒加载
- [ ] 性能监控

## 依赖安装

```bash
cd frontend
npm install zustand axios
npm install -D @types/node
```

## 验收标准

### Phase 1 验收
- [ ] 所有API端点封装完成
- [ ] 请求拦截器正常工作
- [ ] 401自动跳转登录
- [ ] 错误统一处理

### Phase 2 验收
- [ ] 用户登录状态持久化
- [ ] Token自动添加到请求
- [ ] 登出清除所有状态
- [ ] Store状态正常更新

### Phase 3 验收
- [ ] 所有UI组件可正常使用
- [ ] Toast提示正常显示
- [ ] Modal对话框正常工作
- [ ] Upload上传功能完整

### Phase 4 验收
- [ ] 所有工具函数正常工作
- [ ] 验证函数准确
- [ ] 格式化输出正确

### Phase 5 验收
- [ ] 类型定义完整
- [ ] TypeScript无类型错误
- [ ] 代码提示完善

## 预计工时

- Phase 1: 4小时
- Phase 2: 3小时
- Phase 3: 8小时
- Phase 4: 2小时
- Phase 5: 2小时
- Phase 6: 3小时
- Phase 7: 2小时

**总计: 24小时（3个工作日）**
