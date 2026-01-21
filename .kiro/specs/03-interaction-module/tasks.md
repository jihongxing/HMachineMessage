# 交互功能模块 - 任务列表

## 后端任务

### Phase 1: 收藏功能
- [ ] 创建FavoriteService
- [ ] POST /favorites - 收藏
- [ ] DELETE /favorites/:equipmentId - 取消收藏
- [ ] GET /favorites - 收藏列表
- [ ] 收藏数量统计更新

### Phase 2: 评价功能
- [ ] 创建ReviewService
- [ ] POST /reviews - 发布评价
- [ ] PUT /reviews/:id - 修改评价
- [ ] GET /equipment/:id/reviews - 评价列表
- [ ] POST /reviews/:id/report - 举报评价
- [ ] 评分计算和更新

### Phase 3: 浏览历史
- [ ] 创建HistoryService
- [ ] 自动记录浏览（中间件）
- [ ] GET /history - 历史列表
- [ ] DELETE /history - 清空历史

### Phase 4: 通知系统
- [ ] 创建NotificationService
- [ ] GET /notifications - 通知列表
- [ ] PUT /notifications/:id/read - 标记已读
- [ ] PUT /notifications/read-all - 全部已读
- [ ] GET /notifications/unread-count - 未读数量
- [ ] 通知触发器（审核/付费/互动）

## 前端任务

### Phase 1: 收藏功能
- [ ] 收藏按钮组件
- [ ] 我的收藏页面
- [ ] 收藏状态管理

### Phase 2: 评价功能
- [ ] 评价表单组件
- [ ] 评价列表组件
- [ ] 评价详情展示
- [ ] 举报功能

### Phase 3: 浏览历史
- [ ] 浏览历史页面
- [ ] 历史记录卡片

### Phase 4: 通知系统
- [ ] 通知中心页面
- [ ] 通知列表组件
- [ ] 未读数量显示
- [ ] 通知类型筛选

## 优先级

P0（必须）：
- 收藏/取消收藏
- 发布评价
- 通知列表

P1（重要）：
- 评价修改
- 浏览历史
- 未读数量

P2（可选）：
- 举报评价
- 通知筛选
