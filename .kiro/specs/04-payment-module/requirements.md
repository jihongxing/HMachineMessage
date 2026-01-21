# 付费排名模块 - 需求文档

## 功能范围

### 1. 排名档位
- 基础展示：0元/月（免费）
- 推荐位：100元/月
- 置顶位：200元/月

### 2. 推广区域
- 省级推广：全省范围
- 市级推广：全市范围
- 县级推广：全县范围

### 3. 订单管理
- 创建订单
- 支付订单（微信/支付宝/余额）
- 订单列表
- 订单详情
- 申请退款

### 4. 充值功能
- 充值金额：50/100/200/500/1000元
- 充值优惠：充500送50，充1000送150
- 充值记录

### 5. 自动续费
- 开启/关闭自动续费
- 到期前3天提醒
- 余额不足提醒

## 数据模型

### Order表
- id, orderNo, equipmentId, userId
- rankLevel, rankRegion, duration
- amount, payAmount, payMethod
- status, paidAt, refundAt

### Recharge表
- id, userId, orderNo
- amount, bonusAmount, payMethod
- status, paidAt

## API接口

### 订单
1. POST /api/v1/orders - 创建订单
2. POST /api/v1/orders/:id/pay - 支付订单
3. GET /api/v1/orders - 订单列表
4. GET /api/v1/orders/:id - 订单详情
5. POST /api/v1/orders/:id/refund - 申请退款

### 充值
6. POST /api/v1/recharge - 创建充值订单
7. GET /api/v1/recharge/history - 充值记录

### 配置
8. GET /api/v1/config - 获取系统配置（价格/优惠）

## 验收标准

- 订单创建成功率 > 99%
- 支付成功率 > 95%
- 排名生效及时
- 到期自动降级
- 退款流程完整
