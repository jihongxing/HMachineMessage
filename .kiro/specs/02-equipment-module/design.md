# 设备管理模块 - 设计文档

## 技术方案

### 1. 排序算法
```typescript
排序分数 = 档位权重 + 时间戳
- 置顶位权重：1000000000000
- 推荐位权重：500000000000
- 基础展示权重：0
```

### 2. 距离计算
```typescript
// Haversine公式
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number
```

### 3. 图片处理
- 上传前端压缩（< 2MB）
- 后端二次压缩（< 200KB）
- 格式转换：WebP
- CDN加速

### 4. 缓存策略
```typescript
// 热门设备缓存
cache.set(`equipment:hot`, data, 300); // 5分钟

// 分类列表缓存
cache.set(`equipment:category:${id}`, data, 600); // 10分钟

// 设备详情缓存
cache.set(`equipment:${id}`, data, 180); // 3分钟
```

### 5. 数据库索引
```sql
CREATE INDEX idx_status_rank_time ON equipment(status, rank_level, created_at);
CREATE INDEX idx_category ON equipment(category1, category2);
CREATE INDEX idx_region ON equipment(province, city, county);
```

## 数据流

### 发布流程
```
1. 前端表单验证 → 图片上传
2. 后端参数校验 → 创建设备记录
3. 新用户：待审核 / 优质用户：直接发布
4. 返回设备ID和状态
```

### 搜索流程
```
1. 解析查询参数 → 构建查询条件
2. 数据库查询（带索引）
3. 计算距离（如有坐标）
4. 排序 → 分页 → 返回
```

## 性能优化

- 列表查询使用索引
- 热门数据Redis缓存
- 图片CDN加速
- 分页限制最大100条
- 距离计算异步处理
