# 后台管理模块 - 需求文档

## 功能范围

### 1. 智能审核系统
- 自动审核机制（AI风险评分）
- 用户信用体系（新/普通/优质/认证）
- 审核流程优化（分级审核）
- 审核历史记录

### 2. 设备审核
- 待审核列表（按风险评分排序）
- 审核操作（通过/拒绝）
- 批量审核
- 审核统计

### 3. 用户管理
- 用户列表（搜索/筛选）
- 用户详情
- 封禁/解封
- 用户等级调整

### 4. 举报处理
- 举报列表
- 举报详情
- 处理举报（通过/驳回）
- 举报统计

### 5. 数据统计
- 用户统计（总数/新增/活跃）
- 设备统计（总数/新增/分类分布）
- 交易统计（订单/金额/续费率）
- 审核统计（通过率/平均时长）

## 数据模型

### AuditLog表
- id, equipmentId, auditorId
- action, reason, riskScore
- createdAt

### Report表
- id, targetType, targetId, reporterId
- reason, images, status
- handleResult, createdAt

## API接口

### 审核
1. GET /api/v1/admin/equipment/pending - 待审核列表
2. PUT /api/v1/admin/equipment/:id/audit - 审核设备
3. GET /api/v1/admin/audit-logs - 审核历史

### 用户管理
4. GET /api/v1/admin/users - 用户列表
5. GET /api/v1/admin/users/:id - 用户详情
6. PUT /api/v1/admin/users/:id/status - 封禁/解封
7. PUT /api/v1/admin/users/:id/level - 调整等级

### 举报
8. GET /api/v1/admin/reports - 举报列表
9. PUT /api/v1/admin/reports/:id/handle - 处理举报

### 统计
10. GET /api/v1/admin/stats - 数据统计

## 验收标准

- 审核效率提升10倍
- 人工审核率 < 10%
- 审核响应时间 < 24小时
- 统计数据准确
- 举报处理及时
