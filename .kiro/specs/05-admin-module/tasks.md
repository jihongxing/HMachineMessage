# 后台管理模块 - 任务列表

## 后端任务

### Phase 1: 审核系统
- [ ] 创建RiskScoreCalculator
- [ ] 创建AuditService
- [ ] 自动审核逻辑
- [ ] GET /admin/equipment/pending - 待审核列表
- [ ] PUT /admin/equipment/:id/audit - 审核设备
- [ ] GET /admin/audit-logs - 审核历史

### Phase 2: 用户管理
- [ ] 创建UserManagementService
- [ ] GET /admin/users - 用户列表
- [ ] GET /admin/users/:id - 用户详情
- [ ] PUT /admin/users/:id/status - 封禁/解封
- [ ] PUT /admin/users/:id/level - 调整等级
- [ ] 用户等级自动升级

### Phase 3: 举报处理
- [ ] 创建ReportService
- [ ] GET /admin/reports - 举报列表
- [ ] PUT /admin/reports/:id/handle - 处理举报
- [ ] 举报统计

### Phase 4: 数据统计
- [ ] 创建StatsService
- [ ] GET /admin/stats - 综合统计
- [ ] 用户统计
- [ ] 设备统计
- [ ] 交易统计
- [ ] 审核统计

### Phase 5: 权限管理
- [ ] 管理员认证中间件
- [ ] 角色权限控制
- [ ] 操作日志记录

## 前端任务

### Phase 1: 审核管理
- [ ] 待审核列表页面
- [ ] 审核详情页面
- [ ] 审核操作（通过/拒绝）
- [ ] 批量审核
- [ ] 审核历史

### Phase 2: 用户管理
- [ ] 用户列表页面
- [ ] 用户详情页面
- [ ] 封禁/解封操作
- [ ] 等级调整

### Phase 3: 举报管理
- [ ] 举报列表页面
- [ ] 举报详情页面
- [ ] 处理举报

### Phase 4: 数据统计
- [ ] 统计概览页面
- [ ] 图表展示
- [ ] 数据导出

### Phase 5: 布局和导航
- [ ] 后台布局组件
- [ ] 侧边栏导航
- [ ] 管理员登录页面

## 优先级

P0（必须）：
- 设备审核
- 用户管理
- 基础统计

P1（重要）：
- 智能审核
- 举报处理
- 详细统计

P2（可选）：
- 批量操作
- 数据导出
- 操作日志
