# 前端核心基础设施 - 需求文档

## 模块概述

建立前端项目的核心基础设施，包括API客户端、状态管理、通用组件库，为后续功能开发提供统一的技术基础。

## 功能需求

### 1. API客户端封装

#### 1.1 Axios实例配置
- 统一的baseURL配置
- 超时设置
- 请求/响应拦截器
- 错误处理机制

#### 1.2 请求拦截器
- 自动添加JWT Token
- 请求日志记录（开发环境）
- 请求参数序列化

#### 1.3 响应拦截器
- 统一响应格式处理
- 401自动跳转登录
- 403权限提示
- 500错误提示
- Token过期自动刷新

#### 1.4 API方法封装
- GET/POST/PUT/DELETE封装
- 文件上传方法
- 取消请求支持

### 2. 状态管理（Zustand）

#### 2.1 用户状态Store
- 用户信息（id, phone, nickname, avatar, balance, level）
- 登录状态
- Token管理（access_token, refresh_token）
- 登录/登出方法
- 更新用户信息方法
- Token持久化（localStorage）

#### 2.2 应用状态Store
- 加载状态（全局loading）
- Toast消息队列
- Modal状态管理
- 主题设置（已有，需整合）
- 字体大小设置（已有，需整合）

#### 2.3 设备状态Store
- 搜索条件（category, region, keyword, priceRange, sort）
- 设备列表缓存
- 分页信息
- 草稿数据

### 3. 通用组件库

#### 3.1 反馈组件
- Loading（全局/局部）
- Toast（成功/错误/警告/信息）
- Modal（确认/提示/自定义内容）
- Empty（空状态）

#### 3.2 表单组件
- Input（文本/数字/密码）
- Textarea
- Select（单选/多选）
- Checkbox/Radio
- DatePicker
- Upload（图片/文件）
- Cascader（级联选择器）

#### 3.3 展示组件
- Card
- Tag
- Badge
- Avatar
- Pagination
- Tabs
- Collapse

#### 3.4 布局组件
- Container
- Grid
- Divider

### 4. 工具函数库

#### 4.1 格式化工具
- 日期格式化
- 金额格式化
- 手机号格式化
- 距离格式化

#### 4.2 验证工具
- 手机号验证
- 密码强度验证
- 身份证验证
- 邮箱验证

#### 4.3 存储工具
- localStorage封装
- sessionStorage封装
- Cookie操作

#### 4.4 其他工具
- 防抖/节流
- 深拷贝
- URL参数解析
- 文件大小转换

## 非功能需求

### 性能要求
- API请求响应时间 < 2s
- 组件渲染时间 < 100ms
- 状态更新不阻塞UI

### 兼容性要求
- 支持Chrome 90+
- 支持Safari 14+
- 支持移动端浏览器

### 可维护性要求
- TypeScript类型完整
- 代码注释清晰
- 统一的错误处理
- 日志记录规范

## 技术约束

- 使用Next.js 14 App Router
- 使用TypeScript
- 使用Zustand状态管理
- 使用Axios HTTP客户端
- 使用Tailwind CSS样式
- 遵循项目现有代码规范

## 依赖关系

- 依赖后端API接口规范
- 为所有前端功能模块提供基础支持
