# 设备管理模块 - 任务列表

## 后端任务

### Phase 1: 基础服务
- [ ] 创建EquipmentService
- [ ] 实现距离计算工具
- [ ] 实现排序算法

### Phase 2: CRUD接口
- [ ] POST /equipment - 发布设备
- [ ] PUT /equipment/:id - 编辑设备
- [ ] DELETE /equipment/:id - 删除设备
- [ ] GET /equipment/:id - 设备详情
- [ ] PUT /equipment/:id/status - 上架/下架

### Phase 3: 查询接口
- [ ] GET /equipment - 设备列表（搜索/筛选/排序）
- [ ] GET /user/equipment - 我的设备
- [ ] POST /equipment/:id/contact - 查看联系方式

### Phase 4: 优化
- [ ] 添加数据库索引
- [ ] 实现Redis缓存
- [ ] 图片上传服务
- [ ] 联系方式查看限流

## 前端任务

### Phase 1: 页面开发
- [ ] 设备发布页面
- [ ] 设备编辑页面
- [ ] 设备列表页面
- [ ] 设备详情页面
- [ ] 我的设备页面

### Phase 2: 组件开发
- [ ] 图片上传组件
- [ ] 地区选择组件
- [ ] 分类选择组件
- [ ] 搜索筛选组件
- [ ] 设备卡片组件

### Phase 3: 状态管理
- [ ] 设备列表Store
- [ ] 搜索条件Store
- [ ] 草稿保存

### Phase 4: 功能集成
- [ ] 图片压缩
- [ ] 地图定位
- [ ] 距离显示
- [ ] 分享功能

## 优先级

P0（必须）：
- 发布/编辑/删除
- 列表/详情查询
- 基础搜索筛选

P1（重要）：
- 距离计算
- 排序优化
- 图片上传
- 联系方式查看

P2（可选）：
- 草稿保存
- 地图展示
- 二维码分享
