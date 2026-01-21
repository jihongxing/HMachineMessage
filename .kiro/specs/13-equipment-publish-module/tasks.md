# 设备发布模块 - 任务清单

## 前置条件

- [ ] 确认前端核心基础设施模块（12-frontend-infrastructure）已完成
- [ ] 确认后端设备API可用
- [ ] 确认后端上传API可用
- [ ] 确认后端分类/地区API可用

## Phase 1: 图片上传组件 (优先级: P0)

### 1.1 基础上传功能
- [ ] 创建 `components/ui/Upload.tsx`
- [ ] 实现文件选择（input file）
- [ ] 实现拖拽上传
- [ ] 实现粘贴上传
- [ ] 实现多图上传（最多9张）

### 1.2 图片处理
- [ ] 创建 `lib/utils/imageCompress.ts`
- [ ] 实现图片压缩（browser-image-compression）
- [ ] 实现尺寸限制（1920x1080）
- [ ] 实现格式转换（WebP）
- [ ] 实现文件大小验证（5MB）
- [ ] 实现格式验证（jpg/png/webp）

### 1.3 预览功能
- [ ] 实现缩略图展示
- [ ] 实现大图预览（Modal）
- [ ] 实现图片排序（react-beautiful-dnd）
- [ ] 实现删除图片

### 1.4 上传状态
- [ ] 实现上传进度条
- [ ] 实现上传成功提示
- [ ] 实现上传失败提示
- [ ] 实现重新上传

### 1.5 集成上传API
- [ ] 调用 `uploadApi.upload()`
- [ ] 处理上传响应
- [ ] 错误处理

## Phase 2: 地区选择组件 (优先级: P0)

### 2.1 基础组件
- [ ] 创建 `components/ui/RegionSelector.tsx`
- [ ] 实现三级级联选择
- [ ] 实现省份下拉
- [ ] 实现城市下拉（根据省份）
- [ ] 实现区县下拉（根据城市）

### 2.2 数据加载
- [ ] 集成 `regionApi.getProvinces()`
- [ ] 集成 `regionApi.getCities()`
- [ ] 集成 `regionApi.getCounties()`
- [ ] 实现懒加载
- [ ] 实现数据缓存

### 2.3 交互功能
- [ ] 实现搜索功能
- [ ] 实现清空选择
- [ ] 实现默认值设置
- [ ] 实现禁用状态

### 2.4 错误处理
- [ ] 加载失败提示
- [ ] 验证错误提示

## Phase 3: 分类选择组件 (优先级: P0)

### 3.1 基础组件
- [ ] 创建 `components/ui/CategorySelector.tsx`
- [ ] 实现二级级联选择
- [ ] 实现一级分类下拉
- [ ] 实现二级分类下拉（根据一级）

### 3.2 数据加载
- [ ] 集成 `categoryApi.getTree()`
- [ ] 实现数据缓存
- [ ] 实现加载状态

### 3.3 交互功能
- [ ] 实现搜索功能
- [ ] 实现清空选择
- [ ] 实现默认值设置

## Phase 4: 设备表单组件 (优先级: P0)

### 4.1 表单基础
- [ ] 创建 `components/equipment/EquipmentForm.tsx`
- [ ] 安装依赖：react-hook-form、zod、@hookform/resolvers
- [ ] 创建表单Schema（`lib/utils/formValidation.ts`）
- [ ] 初始化useForm
- [ ] 实现表单布局

### 4.2 基本信息区块
- [ ] 设备型号输入框
- [ ] 分类选择器集成
- [ ] 图片上传组件集成
- [ ] 设备描述输入框
- [ ] 作业能力输入框

### 4.3 位置信息区块
- [ ] 地区选择器集成
- [ ] 详细地址输入框
- [ ] 地图选点组件（暂时占位）
- [ ] 经纬度输入框

### 4.4 价格信息区块
- [ ] 价格输入框
- [ ] 价格单位单选框

### 4.5 联系方式区块
- [ ] 联系电话输入框
- [ ] 微信号输入框

### 4.6 可用时间区块
- [ ] 开始日期选择器
- [ ] 结束日期选择器

### 4.7 表单验证
- [ ] 实时验证
- [ ] 失焦验证
- [ ] 提交验证
- [ ] 错误提示显示
- [ ] 滚动到错误字段

### 4.8 表单提交
- [ ] 实现onSubmit处理
- [ ] 调用创建/更新API
- [ ] 成功提示
- [ ] 错误处理
- [ ] Loading状态

## Phase 5: 草稿功能 (优先级: P1)

### 5.1 Store配置
- [ ] 在 `equipmentStore.ts` 添加草稿相关状态
- [ ] 实现saveDraft方法
- [ ] 实现getDraft方法
- [ ] 实现clearDraft方法
- [ ] 实现过期检查（7天）

### 5.2 自动保存
- [ ] 监听表单变化
- [ ] 防抖处理（2秒）
- [ ] 调用saveDraft

### 5.3 草稿恢复
- [ ] 页面加载时检查草稿
- [ ] 显示恢复提示Modal
- [ ] 恢复草稿数据
- [ ] 清除草稿

### 5.4 手动操作
- [ ] 保存草稿按钮
- [ ] 清除草稿按钮

## Phase 6: 发布页面 (优先级: P0)

### 6.1 页面创建
- [ ] 创建 `app/equipment/new/page.tsx`
- [ ] 实现页面布局
- [ ] 集成面包屑导航
- [ ] 集成EquipmentForm组件

### 6.2 权限验证
- [ ] 检查登录状态
- [ ] 未登录跳转登录页

### 6.3 成功处理
- [ ] 提交成功提示
- [ ] 跳转到我的设备页面

## Phase 7: 编辑页面 (优先级: P0)

### 7.1 页面创建
- [ ] 创建 `app/equipment/[id]/edit/page.tsx`
- [ ] 实现页面布局
- [ ] 集成面包屑导航

### 7.2 数据加载
- [ ] 调用 `equipmentApi.getDetail()`
- [ ] 加载状态显示
- [ ] 错误处理（设备不存在）

### 7.3 权限验证
- [ ] 检查是否为设备所有者
- [ ] 检查设备状态（已删除不可编辑）
- [ ] 无权限提示并返回

### 7.4 表单集成
- [ ] 传递initialData到EquipmentForm
- [ ] 设置mode为'edit'

### 7.5 成功处理
- [ ] 更新成功提示
- [ ] 返回我的设备页面

## Phase 8: 我的设备页面 (优先级: P0)

### 8.1 页面创建
- [ ] 创建 `app/profile/equipment/page.tsx`
- [ ] 实现页面布局
- [ ] 添加"发布设备"按钮

### 8.2 统计组件
- [ ] 创建 `components/equipment/EquipmentStats.tsx`
- [ ] 显示总设备数
- [ ] 显示已发布数
- [ ] 显示待审核数
- [ ] 显示总浏览量
- [ ] 显示总联系量

### 8.3 状态筛选
- [ ] 实现Tabs组件
- [ ] 全部/待审核/已发布/已拒绝/已下架
- [ ] 切换时重新加载数据

### 8.4 设备列表组件
- [ ] 创建 `components/equipment/EquipmentList.tsx`
- [ ] 显示设备缩略图
- [ ] 显示设备信息
- [ ] 显示状态徽章
- [ ] 显示统计数据
- [ ] 显示拒绝原因（如有）

### 8.5 状态徽章组件
- [ ] 创建 `components/equipment/StatusBadge.tsx`
- [ ] 待审核（黄色）
- [ ] 已发布（绿色）
- [ ] 已拒绝（红色）
- [ ] 已下架（灰色）

### 8.6 操作功能
- [ ] 编辑按钮（跳转编辑页）
- [ ] 删除按钮（二次确认Modal）
- [ ] 上架/下架按钮（切换状态）
- [ ] 查看详情按钮
- [ ] 推广按钮（跳转订单创建）

### 8.7 数据加载
- [ ] 调用 `equipmentApi.myList()`
- [ ] 实现分页
- [ ] 加载状态
- [ ] 空状态

### 8.8 操作处理
- [ ] 实现handleEdit
- [ ] 实现handleDelete（调用equipmentApi.delete）
- [ ] 实现handleToggleStatus（调用equipmentApi.updateStatus）
- [ ] 实现handlePromote（跳转订单创建）
- [ ] 操作成功后刷新列表

## Phase 9: API集成 (优先级: P0)

### 9.1 设备API
- [ ] 在 `lib/api/endpoints/equipment.ts` 添加方法
- [ ] create - 创建设备
- [ ] update - 更新设备
- [ ] delete - 删除设备
- [ ] updateStatus - 上架/下架
- [ ] getDetail - 获取详情
- [ ] myList - 我的设备列表

### 9.2 上传API
- [ ] 在 `lib/api/endpoints/upload.ts` 添加方法
- [ ] upload - 上传文件（支持进度回调）
- [ ] delete - 删除文件

### 9.3 分类API
- [ ] 在 `lib/api/endpoints/category.ts` 添加方法
- [ ] getTree - 获取分类树

### 9.4 地区API
- [ ] 在 `lib/api/endpoints/region.ts` 添加方法
- [ ] getProvinces - 获取省份
- [ ] getCities - 获取城市
- [ ] getCounties - 获取区县

## Phase 10: 类型定义 (优先级: P0)

### 10.1 设备类型
- [ ] 创建 `types/equipment.ts`
- [ ] Equipment - 设备类型
- [ ] EquipmentFormData - 表单数据类型
- [ ] EquipmentStatus - 状态枚举
- [ ] EquipmentListItem - 列表项类型

### 10.2 其他类型
- [ ] Category - 分类类型
- [ ] Region - 地区类型
- [ ] UploadProgress - 上传进度类型

## Phase 11: 测试和优化 (优先级: P1)

### 11.1 功能测试
- [ ] 测试发布流程
- [ ] 测试编辑流程
- [ ] 测试删除功能
- [ ] 测试上架/下架
- [ ] 测试图片上传
- [ ] 测试草稿保存/恢复
- [ ] 测试表单验证

### 11.2 边界测试
- [ ] 测试未登录访问
- [ ] 测试无权限编辑
- [ ] 测试网络错误
- [ ] 测试上传失败
- [ ] 测试表单验证边界

### 11.3 性能优化
- [ ] 图片懒加载
- [ ] 组件代码分割
- [ ] 防抖节流优化
- [ ] 缓存优化

### 11.4 用户体验优化
- [ ] 加载状态优化
- [ ] 错误提示优化
- [ ] 移动端适配
- [ ] 无障碍优化

## 依赖安装

```bash
cd frontend
npm install react-hook-form zod @hookform/resolvers
npm install browser-image-compression
npm install react-beautiful-dnd
npm install @types/react-beautiful-dnd -D
```

## 验收标准

### Phase 1-3 验收（组件）
- [ ] Upload组件可正常上传图片
- [ ] 图片压缩功能正常
- [ ] 图片预览和排序正常
- [ ] RegionSelector可正常选择省市区
- [ ] CategorySelector可正常选择分类
- [ ] 组件错误提示正常

### Phase 4-5 验收（表单）
- [ ] 表单所有字段正常显示
- [ ] 表单验证规则正确
- [ ] 错误提示清晰
- [ ] 草稿自动保存
- [ ] 草稿恢复正常

### Phase 6-7 验收（发布/编辑）
- [ ] 发布页面正常访问
- [ ] 表单提交成功
- [ ] 编辑页面加载数据正确
- [ ] 更新功能正常
- [ ] 权限验证正确

### Phase 8 验收（我的设备）
- [ ] 设备列表正常显示
- [ ] 状态筛选正常
- [ ] 统计数据正确
- [ ] 所有操作功能正常
- [ ] 分页功能正常

### Phase 9-10 验收（API和类型）
- [ ] 所有API调用正常
- [ ] 类型定义完整
- [ ] TypeScript无错误

### Phase 11 验收（测试和优化）
- [ ] 所有功能测试通过
- [ ] 边界情况处理正确
- [ ] 性能满足要求
- [ ] 用户体验良好

## 预计工时

- Phase 1: 6小时（图片上传组件）
- Phase 2: 3小时（地区选择组件）
- Phase 3: 2小时（分类选择组件）
- Phase 4: 6小时（设备表单组件）
- Phase 5: 2小时（草稿功能）
- Phase 6: 2小时（发布页面）
- Phase 7: 2小时（编辑页面）
- Phase 8: 4小时（我的设备页面）
- Phase 9: 3小时（API集成）
- Phase 10: 1小时（类型定义）
- Phase 11: 3小时（测试和优化）

**总计: 34小时（约4-5个工作日）**

## 开发顺序建议

1. **第一天**：Phase 1-3（组件开发）
2. **第二天**：Phase 4-5（表单和草稿）
3. **第三天**：Phase 6-8（页面开发）
4. **第四天**：Phase 9-10（API和类型）
5. **第五天**：Phase 11（测试和优化）
