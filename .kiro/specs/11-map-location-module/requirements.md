# 地图定位模块 - 需求文档

## 功能范围

### 1. 地图展示
- 设备列表地图模式
- 设备位置标记
- 点击标记显示简要信息
- 地图/列表切换

### 2. 位置选择
- 发布设备时选择位置
- 地图拖拽选点
- 地址搜索
- 自动定位

### 3. 距离计算
- 用户位置获取
- 设备距离计算（Haversine公式）
- 距离显示（米/公里）
- 按距离排序

### 4. 地理编码
- 地址转坐标（正向编码）
- 坐标转地址（逆向编码）
- 结果缓存

## 数据模型

### Equipment表
- latitude, longitude（已存在）

### GeocodingCache表
- id, key, address
- latitude, longitude
- expiresAt

## API接口

1. GET /api/v1/map/geocode - 地址转坐标
2. GET /api/v1/map/reverse-geocode - 坐标转地址
3. GET /api/v1/equipment/nearby - 附近设备

## 技术方案

### 地图服务
- 高德地图API（国内）
- 百度地图API（备选）

### 距离计算
- Haversine公式
- 数据库空间索引（可选）

## 验收标准

- 定位准确
- 距离计算正确
- 地图加载快
- 标记点击流畅
