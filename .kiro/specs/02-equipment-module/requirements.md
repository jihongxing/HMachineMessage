# 设备管理模块 - 需求文档

## 功能范围

### 1. 设备发布
- 必填字段：分类、型号、地区、地址、价格、联系电话、图片（3-9张）
- 选填字段：描述、作业能力、可租时间、微信号
- 草稿保存（自动/手动）
- 图片上传（压缩、裁剪）

### 2. 设备编辑
- 基础信息修改：无需审核
- 图片/描述修改：需审核（普通用户）
- 价格/联系方式修改：无需审核

### 3. 设备列表/搜索
- 筛选：分类、地区、价格区间、排名档位
- 排序：距离、时间、热度、排名
- 分页：20条/页
- 距离计算（Haversine公式）

### 4. 设备详情
- 完整信息展示
- 联系方式查看（需登录）
- 相关推荐
- 二维码分享

### 5. 我的设备
- 已发布/审核中/已拒绝/已下架
- 数据统计（浏览/联系/扫码）
- 上架/下架操作

## 数据模型

### Equipment表
- 基础信息：category1, category2, model, province, city, county, address
- 价格信息：price, priceUnit
- 联系方式：phone, wechat
- 媒体：images, description
- 状态：status, rankLevel, rankExpire
- 统计：viewCount, contactCount, favoriteCount, scanCount, rating

## API接口

1. POST /api/v1/equipment - 发布设备
2. PUT /api/v1/equipment/:id - 编辑设备
3. DELETE /api/v1/equipment/:id - 删除设备
4. GET /api/v1/equipment/:id - 设备详情
5. GET /api/v1/equipment - 设备列表
6. GET /api/v1/user/equipment - 我的设备
7. PUT /api/v1/equipment/:id/status - 上架/下架
8. POST /api/v1/equipment/:id/contact - 查看联系方式

## 验收标准

- 发布流程完整
- 搜索响应时间 < 500ms
- 图片上传成功率 > 95%
- 距离计算准确
- 排序规则正确
