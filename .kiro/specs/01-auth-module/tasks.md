# 用户认证模块 - 任务列表

## 后端任务

### Phase 1: 基础服务
- [ ] 创建SmsService（验证码服务）
- [ ] 创建AuthService（认证服务）
- [ ] 实现密码加密/验证工具

### Phase 2: API实现
- [ ] POST /auth/sms/send - 发送验证码
- [ ] POST /auth/register - 注册
- [ ] POST /auth/login - 密码登录
- [ ] POST /auth/login/sms - 验证码登录
- [ ] POST /auth/password/reset - 找回密码

### Phase 3: 安全机制
- [ ] 验证码限流（Redis）
- [ ] 登录失败锁定（Redis）
- [ ] 图形验证码集成
- [ ] JWT中间件完善

### Phase 4: 测试
- [ ] 单元测试
- [ ] 接口测试
- [ ] 限流测试

## 前端任务

### Phase 1: 页面开发
- [ ] 注册页面
- [ ] 登录页面
- [ ] 找回密码页面

### Phase 2: 状态管理
- [ ] 用户状态Store（Zustand）
- [ ] Token存储/读取
- [ ] 自动登录

### Phase 3: 表单验证
- [ ] 手机号验证
- [ ] 密码强度验证
- [ ] 验证码倒计时

### Phase 4: API集成
- [ ] 封装认证API
- [ ] 请求拦截器（Token）
- [ ] 响应拦截器（401处理）

## 优先级

P0（必须）：
- 注册/登录基础功能
- JWT认证
- 验证码发送

P1（重要）：
- 限流机制
- 密码找回
- 登录失败锁定

P2（可选）：
- 微信登录
- 图形验证码
