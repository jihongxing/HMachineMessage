# 付费排名模块 - 设计文档

## 技术方案

### 1. 订单服务
```typescript
class OrderService {
  async create(data: CreateOrderDto): Promise<Order>
  async pay(orderId: bigint, payMethod: string): Promise<PaymentResult>
  async list(userId: bigint, filters, pagination): Promise<PaginationResult>
  async refund(orderId: bigint, reason: string): Promise<void>
}
```

### 2. 支付集成
```typescript
interface PaymentProvider {
  createPayment(order: Order): Promise<PaymentData>
  verifyCallback(data: any): Promise<boolean>
  refund(orderNo: string, amount: number): Promise<boolean>
}

class WechatPayProvider implements PaymentProvider {}
class AlipayProvider implements PaymentProvider {}
class BalanceProvider implements PaymentProvider {}
```

### 3. 排名生效逻辑
```typescript
// 支付成功后
async function activateRank(order: Order) {
  const expireDate = new Date();
  expireDate.setMonth(expireDate.getMonth() + order.duration);
  
  await prisma.equipment.update({
    where: { id: order.equipmentId },
    data: {
      rankLevel: order.rankLevel,
      rankRegion: order.rankRegion,
      rankExpire: expireDate,
    },
  });
}
```

### 4. 定时任务
```typescript
// 每天检查到期排名
cron.schedule('0 0 * * *', async () => {
  const expired = await prisma.equipment.findMany({
    where: {
      rankExpire: { lte: new Date() },
      rankLevel: { gt: 0 },
    },
  });
  
  // 降级为基础展示
  await prisma.equipment.updateMany({
    where: { id: { in: expired.map(e => e.id) } },
    data: { rankLevel: 0, rankExpire: null },
  });
  
  // 发送到期通知
  for (const eq of expired) {
    await notificationService.create(eq.userId, 'payment', {
      title: '排名已到期',
      content: `您的设备"${eq.model}"排名已到期`,
    });
  }
});

// 到期前3天提醒
cron.schedule('0 9 * * *', async () => {
  const threeDaysLater = new Date();
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);
  
  const expiring = await prisma.equipment.findMany({
    where: {
      rankExpire: {
        gte: new Date(),
        lte: threeDaysLater,
      },
      rankLevel: { gt: 0 },
    },
  });
  
  // 发送提醒通知
  for (const eq of expiring) {
    await notificationService.create(eq.userId, 'payment', {
      title: '排名即将到期',
      content: `您的设备"${eq.model}"排名将在3天后到期`,
    });
  }
});
```

### 5. 退款规则
```typescript
function calculateRefund(order: Order): number {
  const now = new Date();
  const paidAt = new Date(order.paidAt);
  const daysUsed = Math.ceil((now - paidAt) / (1000 * 60 * 60 * 24));
  const totalDays = order.duration * 30;
  const dailyPrice = order.payAmount / totalDays;
  
  return Math.max(0, order.payAmount - dailyPrice * daysUsed);
}
```

## 数据流

### 支付流程
```
1. 创建订单 → 生成订单号
2. 选择支付方式 → 调用支付接口
3. 返回支付参数 → 前端唤起支付
4. 支付成功回调 → 验证签名
5. 更新订单状态 → 激活排名
6. 发送通知
```

### 退款流程
```
1. 申请退款 → 计算退款金额
2. 调用支付退款接口
3. 退款成功 → 更新订单状态
4. 降级排名 → 发送通知
```

## 安全机制

- 订单号唯一性校验
- 支付回调签名验证
- 重复支付检测
- 退款金额校验
- 余额扣减事务处理
