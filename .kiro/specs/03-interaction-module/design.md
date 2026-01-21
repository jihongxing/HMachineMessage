# 交互功能模块 - 设计文档

## 技术方案

### 1. 收藏服务
```typescript
class FavoriteService {
  async add(userId: bigint, equipmentId: bigint): Promise<void>
  async remove(userId: bigint, equipmentId: bigint): Promise<void>
  async list(userId: bigint, pagination): Promise<PaginationResult>
  async isFavorited(userId: bigint, equipmentId: bigint): Promise<boolean>
}
```

**数据库设计**：
- 唯一索引：(userId, equipmentId)
- 查询索引：userId, equipmentId

### 2. 评价服务
```typescript
class ReviewService {
  async create(data: CreateReviewDto): Promise<Review>
  async update(id: bigint, data: UpdateReviewDto): Promise<Review>
  async list(equipmentId: bigint, pagination): Promise<PaginationResult>
  async report(reviewId: bigint, userId: bigint, reason: string): Promise<void>
}
```

**评价权限校验**：
- 必须查看过联系方式
- 每个用户对同一设备只能评价1次
- 7天内可修改

**评分计算**：
```typescript
// 更新设备平均评分
avgRating = (totalRating + newRating) / (ratingCount + 1)
```

### 3. 浏览历史
```typescript
class HistoryService {
  async record(userId: bigint, equipmentId: bigint): Promise<void>
  async list(userId: bigint, limit: number): Promise<Equipment[]>
  async clear(userId: bigint): Promise<void>
}
```

**存储策略**：
- 最多保留30条
- 按时间倒序
- 自动去重（同一设备只保留最新记录）

### 4. 通知服务
```typescript
class NotificationService {
  async create(userId: bigint, type: string, data: NotificationData): Promise<void>
  async list(userId: bigint, filters, pagination): Promise<PaginationResult>
  async markRead(id: bigint): Promise<void>
  async markAllRead(userId: bigint): Promise<void>
  async getUnreadCount(userId: bigint): Promise<UnreadCount>
}
```

**通知类型**：
- audit: 审核通知
- payment: 付费通知
- interaction: 互动通知
- system: 系统通知

## 缓存策略

```typescript
// 收藏状态缓存
cache.set(`favorite:${userId}:${equipmentId}`, true, 600);

// 评价列表缓存
cache.set(`reviews:${equipmentId}:page:${page}`, data, 300);

// 未读通知数缓存
cache.set(`notification:unread:${userId}`, count, 60);
```

## 性能优化

- 收藏/取消收藏异步更新计数
- 评价列表分页查询
- 浏览历史限制30条
- 通知列表索引优化
