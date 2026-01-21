# 订单支付模块 - 设计文档

## 架构设计

### 目录结构

```
frontend/src/
├── app/
│   ├── orders/
│   │   ├── page.tsx                  # 订单列表
│   │   ├── create/
│   │   │   └── page.tsx              # 创建订单
│   │   └── [id]/
│   │       ├── page.tsx              # 订单详情
│   │       └── pay/
│   │           └── page.tsx          # 支付页面
│   └── recharge/
│       ├── page.tsx                  # 充值页面（已存在）
│       └── history/
│           └── page.tsx              # 充值记录
├── components/
│   ├── order/
│   │   ├── OrderList.tsx             # 订单列表组件
│   │   ├── OrderCard.tsx             # 订单卡片
│   │   ├── OrderDetail.tsx           # 订单详情
│   │   ├── RankSelector.tsx          # 档位选择器
│   │   └── PriceCalculator.tsx       # 价格计算器
│   ├── payment/
│   │   ├── PaymentSelector.tsx       # 支付方式选择
│   │   ├── QRCodePay.tsx             # 二维码支付
│   │   ├── BalancePay.tsx            # 余额支付
│   │   └── PaymentStatus.tsx         # 支付状态
│   └── recharge/
│       ├── AmountSelector.tsx        # 金额选择器
│       └── RechargeList.tsx          # 充值记录列表
├── lib/
│   ├── api/endpoints/
│   │   ├── order.ts                  # 订单API
│   │   └── recharge.ts               # 充值API
│   ├── store/
│   │   └── orderStore.ts             # 订单状态管理
│   └── utils/
│       └── payment.ts                # 支付工具函数
└── types/
    ├── order.ts                      # 订单类型
    └── payment.ts                    # 支付类型
```

## 详细设计

### 1. 订单创建页面

```typescript
// app/orders/create/page.tsx
export default function OrderCreatePage() {
  const searchParams = useSearchParams();
  const equipmentId = searchParams.get('equipmentId');
  
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [rankLevel, setRankLevel] = useState(1);
  const [rankRegion, setRankRegion] = useState<'province' | 'city' | 'county'>('county');
  const [duration, setDuration] = useState(1);

  useEffect(() => {
    if (equipmentId) {
      equipmentApi.getDetail(equipmentId).then(setEquipment);
    }
  }, [equipmentId]);

  const price = calculatePrice(rankLevel, rankRegion, duration);

  const handleSubmit = async () => {
    try {
      const result = await orderApi.create({
        equipmentId,
        rankLevel,
        rankRegion,
        duration,
      });
      router.push(`/orders/${result.orderId}/pay`);
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    }
  };

  return (
    <Container>
      <h1>购买推广</h1>
      
      {/* 设备信息 */}
      <Card>
        <img src={equipment?.images[0]} />
        <h3>{equipment?.model}</h3>
        <p>{equipment?.city} {equipment?.county}</p>
      </Card>

      {/* 档位选择 */}
      <RankSelector
        value={rankLevel}
        onChange={setRankLevel}
      />

      {/* 区域选择 */}
      <RegionSelector
        value={rankRegion}
        onChange={setRankRegion}
        equipment={equipment}
      />

      {/* 时长选择 */}
      <DurationSelector
        value={duration}
        onChange={setDuration}
      />

      {/* 价格计算 */}
      <PriceCalculator
        rankLevel={rankLevel}
        rankRegion={rankRegion}
        duration={duration}
      />

      {/* 提交按钮 */}
      <Button onClick={handleSubmit}>
        创建订单
      </Button>
    </Container>
  );
}
```

### 2. 支付页面设计

```typescript
// app/orders/[id]/pay/page.tsx
export default function OrderPayPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay' | 'balance'>('wechat');
  const [paying, setPaying] = useState(false);
  const [payResult, setPayResult] = useState<any>(null);

  useEffect(() => {
    orderApi.getDetail(orderId).then(setOrder);
  }, [orderId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      const result = await orderApi.pay(orderId, payMethod);
      
      if (payMethod === 'balance') {
        // 余额支付直接成功
        showToast({ type: 'success', message: '支付成功' });
        router.push(`/orders/${orderId}`);
      } else {
        // 第三方支付显示二维码
        setPayResult(result);
        startPolling();
      }
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setPaying(false);
    }
  };

  const startPolling = () => {
    const timer = setInterval(async () => {
      const order = await orderApi.getDetail(orderId);
      if (order.status === 1) {
        clearInterval(timer);
        showToast({ type: 'success', message: '支付成功' });
        router.push(`/orders/${orderId}`);
      }
    }, 3000);

    // 5分钟后停止轮询
    setTimeout(() => clearInterval(timer), 300000);
  };

  return (
    <Container>
      <h1>支付订单</h1>

      {/* 订单信息 */}
      <OrderDetail order={order} />

      {/* 支付方式选择 */}
      <PaymentSelector
        value={payMethod}
        onChange={setPayMethod}
        balance={user?.balance}
        amount={order?.payAmount}
      />

      {/* 支付按钮 */}
      {!payResult && (
        <Button onClick={handlePay} loading={paying}>
          确认支付 ¥{order?.payAmount}
        </Button>
      )}

      {/* 二维码支付 */}
      {payResult && payMethod !== 'balance' && (
        <QRCodePay
          qrcode={payResult.qrcode}
          payUrl={payResult.payUrl}
          amount={order?.payAmount}
        />
      )}
    </Container>
  );
}
```

### 3. 订单列表页面

```typescript
// app/orders/page.tsx
export default function OrdersPage() {
  const [status, setStatus] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useOrders({ status, page });

  const handlePay = (orderId: string) => {
    router.push(`/orders/${orderId}/pay`);
  };

  const handleRefund = async (orderId: string) => {
    const confirmed = await showModal({
      title: '申请退款',
      content: '确认申请退款吗？退款金额将返回账户余额',
      confirmText: '确认退款',
    });

    if (confirmed) {
      try {
        await orderApi.refund(orderId, '用户主动申请');
        showToast({ type: 'success', message: '退款成功' });
        refetch();
      } catch (error) {
        showToast({ type: 'error', message: error.message });
      }
    }
  };

  return (
    <Container>
      <h1>我的订单</h1>

      {/* 状态筛选 */}
      <Tabs
        value={status}
        onChange={setStatus}
        items={[
          { label: '全部', value: undefined },
          { label: '待支付', value: 0 },
          { label: '已支付', value: 1 },
          { label: '已退款', value: 2 },
          { label: '已取消', value: 3 },
        ]}
      />

      {/* 订单列表 */}
      <OrderList
        orders={data?.list}
        loading={loading}
        onPay={handlePay}
        onRefund={handleRefund}
      />

      {/* 分页 */}
      <Pagination
        current={page}
        total={data?.total}
        pageSize={20}
        onChange={setPage}
      />
    </Container>
  );
}
```

### 4. 订单列表组件

```typescript
// components/order/OrderList.tsx
interface OrderListProps {
  orders: Order[];
  loading: boolean;
  onPay: (orderId: string) => void;
  onRefund: (orderId: string) => void;
}

export default function OrderList({ orders, loading, onPay, onRefund }: OrderListProps) {
  if (loading) return <Loading />;
  if (!orders?.length) return <Empty message="暂无订单" />;

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="flex gap-4">
          {/* 设备图片 */}
          <img
            src={order.equipment?.images[0]}
            alt={order.equipment?.model}
            className="w-24 h-24 object-cover rounded"
          />

          {/* 订单信息 */}
          <div className="flex-1">
            <div className="flex justify-between">
              <div>
                <h3>{order.equipment?.model}</h3>
                <p className="text-sm text-gray-600">
                  订单号：{order.orderNo}
                </p>
                <p className="text-sm text-gray-600">
                  {getRankLevelText(order.rankLevel)} · 
                  {getRankRegionText(order.rankRegion)} · 
                  {order.duration}个月
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-bold text-primary">
                  ¥{order.payAmount}
                </p>
                <StatusBadge status={order.status} />
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/orders/${order.id}`)}
              >
                查看详情
              </Button>

              {order.status === 0 && (
                <Button
                  size="sm"
                  onClick={() => onPay(order.id)}
                >
                  去支付
                </Button>
              )}

              {order.status === 1 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRefund(order.id)}
                >
                  申请退款
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

### 5. 支付方式选择器

```typescript
// components/payment/PaymentSelector.tsx
interface PaymentSelectorProps {
  value: 'wechat' | 'alipay' | 'balance';
  onChange: (value: 'wechat' | 'alipay' | 'balance') => void;
  balance?: number;
  amount?: number;
}

export default function PaymentSelector({
  value,
  onChange,
  balance = 0,
  amount = 0
}: PaymentSelectorProps) {
  const insufficient = balance < amount;

  return (
    <div className="space-y-3">
      <h3>选择支付方式</h3>

      {/* 微信支付 */}
      <label className={`payment-option ${value === 'wechat' ? 'selected' : ''}`}>
        <input
          type="radio"
          value="wechat"
          checked={value === 'wechat'}
          onChange={(e) => onChange(e.target.value as any)}
        />
        <img src="/icons/wechat.png" alt="微信支付" />
        <span>微信支付</span>
      </label>

      {/* 支付宝支付 */}
      <label className={`payment-option ${value === 'alipay' ? 'selected' : ''}`}>
        <input
          type="radio"
          value="alipay"
          checked={value === 'alipay'}
          onChange={(e) => onChange(e.target.value as any)}
        />
        <img src="/icons/alipay.png" alt="支付宝支付" />
        <span>支付宝支付</span>
      </label>

      {/* 余额支付 */}
      <label className={`payment-option ${value === 'balance' ? 'selected' : ''} ${insufficient ? 'disabled' : ''}`}>
        <input
          type="radio"
          value="balance"
          checked={value === 'balance'}
          onChange={(e) => onChange(e.target.value as any)}
          disabled={insufficient}
        />
        <img src="/icons/balance.png" alt="余额支付" />
        <span>余额支付</span>
        <span className={insufficient ? 'text-red-600' : 'text-gray-600'}>
          余额：¥{balance}
          {insufficient && ' (余额不足)'}
        </span>
      </label>

      {insufficient && (
        <Button
          variant="link"
          onClick={() => router.push('/recharge')}
        >
          去充值
        </Button>
      )}
    </div>
  );
}
```

### 6. 二维码支付组件

```typescript
// components/payment/QRCodePay.tsx
interface QRCodePayProps {
  qrcode: string;
  payUrl: string;
  amount: number;
}

export default function QRCodePay({ qrcode, payUrl, amount }: QRCodePayProps) {
  const [countdown, setCountdown] = useState(900); // 15分钟

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="text-center">
      <h3>扫码支付</h3>
      
      {/* 二维码 */}
      <div className="qrcode-container">
        <img src={qrcode} alt="支付二维码" />
      </div>

      {/* 金额 */}
      <p className="text-2xl font-bold text-primary">
        ¥{amount}
      </p>

      {/* 提示 */}
      <p className="text-gray-600">
        请使用{payUrl.includes('wechat') ? '微信' : '支付宝'}扫码支付
      </p>

      {/* 倒计时 */}
      {countdown > 0 ? (
        <p className="text-sm text-gray-500">
          请在 {minutes}:{seconds.toString().padStart(2, '0')} 内完成支付
        </p>
      ) : (
        <p className="text-red-600">
          二维码已过期，请重新创建订单
        </p>
      )}

      {/* 支付状态提示 */}
      <div className="mt-4 p-4 bg-blue-50 rounded">
        <p className="text-sm text-blue-600">
          支付完成后页面将自动跳转...
        </p>
      </div>
    </div>
  );
}
```

### 7. 充值页面优化

```typescript
// app/recharge/page.tsx (优化现有页面)
export default function RechargePage() {
  const [amount, setAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'wechat' | 'alipay'>('wechat');
  const { user } = useUserStore();

  const bonusAmount = calculateBonus(amount);
  const totalAmount = amount + bonusAmount;

  const handleRecharge = async () => {
    try {
      const result = await rechargeApi.create({
        amount,
        payMethod,
      });
      
      // 跳转支付页面或显示二维码
      setPayResult(result);
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    }
  };

  return (
    <Container>
      <h1>账户充值</h1>

      {/* 当前余额 */}
      <Card>
        <p className="text-gray-600">当前余额</p>
        <p className="text-3xl font-bold text-primary">
          ¥{user?.balance || 0}
        </p>
      </Card>

      {/* 金额选择 */}
      <AmountSelector
        value={amount}
        onChange={setAmount}
        customAmount={customAmount}
        onCustomAmountChange={setCustomAmount}
      />

      {/* 优惠提示 */}
      {bonusAmount > 0 && (
        <div className="bonus-tip">
          充值{amount}元，赠送{bonusAmount}元，到账{totalAmount}元
        </div>
      )}

      {/* 支付方式 */}
      <PaymentSelector
        value={payMethod}
        onChange={setPayMethod}
        hideBalance
      />

      {/* 充值按钮 */}
      <Button onClick={handleRecharge}>
        充值 ¥{amount}
      </Button>

      {/* 充值记录入口 */}
      <Button
        variant="link"
        onClick={() => router.push('/recharge/history')}
      >
        查看充值记录
      </Button>
    </Container>
  );
}
```

### 8. 价格计算工具

```typescript
// lib/utils/payment.ts
export const RANK_PRICES = {
  1: { province: 100, city: 80, county: 50 },
  2: { province: 200, city: 150, county: 100 },
};

export function calculatePrice(
  rankLevel: 1 | 2,
  rankRegion: 'province' | 'city' | 'county',
  duration: number
): number {
  const pricePerMonth = RANK_PRICES[rankLevel][rankRegion];
  return pricePerMonth * duration;
}

export function calculateBonus(amount: number): number {
  if (amount >= 1000) return 150;
  if (amount >= 500) return 50;
  if (amount >= 100) return 10;
  return 0;
}

export function getRankLevelText(level: number): string {
  return level === 1 ? '推荐位' : '置顶位';
}

export function getRankRegionText(region: string): string {
  const map: Record<string, string> = {
    province: '省级推广',
    city: '市级推广',
    county: '区县推广',
  };
  return map[region] || region;
}

export function getOrderStatusText(status: number): string {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已退款',
    3: '已取消',
  };
  return map[status] || '未知';
}
```

## 数据流设计

### 订单创建流程

```
选择设备 →
选择档位/区域/时长 →
计算价格 →
创建订单 →
跳转支付页面
```

### 支付流程

```
选择支付方式 →
余额支付：
  检查余额 →
  扣除余额 →
  激活推广 →
  发送通知 →
  跳转订单详情

第三方支付：
  生成二维码 →
  用户扫码支付 →
  轮询订单状态 →
  支付成功 →
  跳转订单详情
```

### 退款流程

```
申请退款 →
填写原因 →
确认退款 →
退款到余额 →
取消推广 →
发送通知 →
刷新订单列表
```

### 充值流程

```
选择金额 →
计算优惠 →
选择支付方式 →
创建充值订单 →
显示二维码 →
用户扫码支付 →
轮询充值状态 →
充值成功 →
更新余额 →
发送通知
```

## 性能优化

### 1. 支付轮询优化
- 使用指数退避策略
- 最多轮询100次
- 支付成功立即停止

### 2. 订单列表优化
- 分页加载
- 虚拟滚动（可选）
- 图片懒加载

### 3. 缓存策略
- 订单详情缓存5分钟
- 充值记录缓存1分钟

## 错误处理

### 1. 订单创建错误
- 设备不存在：提示并返回
- 设备未发布：提示并返回
- 参数错误：提示修改

### 2. 支付错误
- 余额不足：提示充值
- 订单已支付：提示并跳转
- 支付超时：提示重新支付

### 3. 退款错误
- 订单状态错误：提示
- 退款失败：提示联系客服
