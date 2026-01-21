# 用户中心模块 - 任务列表

## 后端任务

### Phase 1: 个人信息
- [ ] GET /user/profile - 获取资料
- [ ] PUT /user/profile - 更新资料
- [ ] PUT /user/password - 修改密码
- [ ] PUT /user/phone - 更换手机号

### Phase 2: 认证管理
- [ ] 创建VerificationService
- [ ] POST /user/verify/realname - 实名认证
- [ ] POST /user/verify/company - 企业认证
- [ ] 第三方认证API集成

### Phase 3: 账户管理
- [ ] 创建AccountService
- [ ] GET /user/balance - 余额查询
- [ ] GET /user/transactions - 消费记录
- [ ] POST /user/withdraw - 提现申请

## 前端任务

### Phase 1: 个人中心首页
- [ ] 个人中心布局
- [ ] 用户信息展示
- [ ] 快捷入口

### Phase 2: 个人信息
- [ ] 个人资料页面
- [ ] 头像上传
- [ ] 修改密码页面
- [ ] 更换手机号页面

### Phase 3: 认证管理
- [ ] 实名认证页面
- [ ] 企业认证页面
- [ ] 认证状态显示

### Phase 4: 我的设备
- [ ] 我的设备列表
- [ ] 状态筛选
- [ ] 数据统计展示

### Phase 5: 账户管理
- [ ] 余额显示
- [ ] 消费记录页面
- [ ] 提现页面

## 优先级

P0（必须）：
- 个人资料
- 修改密码
- 我的设备

P1（重要）：
- 认证管理
- 账户余额
- 消费记录

P2（可选）：
- 更换手机号
- 提现功能
