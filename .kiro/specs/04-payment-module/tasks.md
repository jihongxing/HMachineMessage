# 付费排名模块 - 任务列表

## 后端任务

### Phase 1: 订单服务
- [ ] 创建OrderService
- [ ] POST /orders - 创建订单
- [ ] GET /orders - 订单列表
- [ ] GET /orders/:id - 订单详情
- [ ] 订单号生成器

### Phase 2: 支付集成
- [ ] 创建PaymentProvider接口
- [ ] 实现WechatPayProvider
- [ ] 实现AlipayProvider
- [ ] 实现BalanceProvider
- [ ] POST /orders/:id/pay - 支付订单
- [ ] POST /payment/callback/wechat - 微信回调
- [ ] POST /payment/callback/alipay - 支付宝回调

### Phase 3: 充值功能
- [ ] 创建RechargeService
- [ ] POST /recharge - 创建充值订单
- [ ] GET /recharge/history - 充值记录
- [ ] 充值优惠计算

### Phase 4: 排名管理
- [ ] 排名激活逻辑
- [ ] 定时任务：到期检查
- [ ] 定时任务：到期提醒
- [ ] POST /orders/:id/refund - 申请退款
- [ ] 退款金额计算

### Phase 5: 配置管理
- [ ] GET /config - 系统配置
- [ ] 价格配置
- [ ] 优惠规则配置

## 前端任务

### Phase 1: 订单页面
- [ ] 创建订单页面
- [ ] 订单列表页面
- [ ] 订单详情页面

### Phase 2: 支付功能
- [ ] 支付方式选择组件
- [ ] 微信支付集成
- [ ] 支付宝支付集成
- [ ] 余额支付

### Phase 3: 充值功能
- [ ] 充值页面
- [ ] 充值记录页面
- [ ] 余额显示

### Phase 4: 排名管理
- [ ] 排名购买入口
- [ ] 排名状态显示
- [ ] 到期提醒
- [ ] 退款申请

## 优先级

P0（必须）：
- 订单创建
- 支付集成（微信/支付宝）
- 排名激活

P1（重要）：
- 充值功能
- 余额支付
- 到期检查

P2（可选）：
- 自动续费
- 退款功能
- 发票开具
