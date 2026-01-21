# 交互功能模块 - 需求文档

## 功能范围

### 1. 收藏功能
- 收藏/取消收藏
- 我的收藏列表
- 收藏数量统计

### 2. 评价功能
- 发布评价（星级+文字+图片+标签）
- 修改评价（7天内）
- 评价列表展示
- 举报恶意评价

### 3. 浏览历史
- 自动记录（最近30条）
- 历史列表
- 清空历史

### 4. 通知系统
- 审核通知
- 付费通知
- 互动通知（联系/收藏/评价）
- 系统通知

## 数据模型

### Favorite表
- id, equipmentId, userId, createdAt

### Review表
- id, equipmentId, userId, rating, content, images, tags
- status, reportCount, createdAt

### ViewHistory表
- id, userId, equipmentId, createdAt

### Notification表
- id, userId, type, title, content, relatedId
- isRead, createdAt

## API接口

### 收藏
1. POST /api/v1/favorites - 收藏
2. DELETE /api/v1/favorites/:equipmentId - 取消收藏
3. GET /api/v1/favorites - 收藏列表

### 评价
4. POST /api/v1/reviews - 发布评价
5. PUT /api/v1/reviews/:id - 修改评价
6. GET /api/v1/equipment/:id/reviews - 评价列表
7. POST /api/v1/reviews/:id/report - 举报评价

### 历史
8. GET /api/v1/history - 浏览历史
9. DELETE /api/v1/history - 清空历史

### 通知
10. GET /api/v1/notifications - 通知列表
11. PUT /api/v1/notifications/:id/read - 标记已读
12. PUT /api/v1/notifications/read-all - 全部已读
13. GET /api/v1/notifications/unread-count - 未读数量

## 验收标准

- 收藏操作实时生效
- 评价发布成功率 > 99%
- 通知推送及时
- 历史记录准确
