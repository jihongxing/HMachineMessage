# 订单支付模块 - 任务清单

## 前置条件

- [ ] 确认前端核心基础设施模块（12）已完成
- [ ] 确认后端订单API可用
- [ ] 确认后端充值API可用

## Phase 1: 工具函数和类型 (优先级: P0)

### 1.1 类型定义
- [ ] 创建 `types/order.ts`
- [ ] Order - 订单类型
- [ ] OrderStatus - 订单状态枚举
- [ ] RankLevel - 档位类型
- [ ] RankRegion - 区域类型
- [ ] CreateOrderDto - 创建订单DTO

- [ ] 创建 `types/payment.ts`
- [ ] PayMethod - 支付方式类型
- [ ] PaymentResult - 支付结果类型
- [ ] Recharge - 充值类型

### 1.2 工具函数
- [ ] 创建 `lib/utils/payment.ts`
- [ ] calculatePrice - 价格计算
- [ ] calculateBonus - 优惠计算
- [ ] getRankLevelText - 档位文本
- [ ] getRankRegionText - 区域文本
- [ ] getOrderStatusText - 状态文本
- [ ] RANK_PRICES - 价格配置

## Phase 2: API集成 (优先级: P0)

### 2.1 订单API
- [ ] 创建 `lib/api/endpoints/order.ts`
- [ ] create - 创建订单
- [ ] pay - 支付订单
- [ ] getList - 订单列表
- [ ] getDetail - 订单详情
- [ ] refund - 申请退款
- [ ] cancel - 取消订单

### 2.2 充值API
- [ ] 创建 `lib/api/endpoints/recharge.ts`
- [ ] create - 创建充值订单
- [ ] getHistory - 充值记录

## Phase 3: 基础组件 (优先级: P0)

### 3.1 档位选择器
- [ ] 创建 `components/order/RankSelector.tsx`
- [ ] 推荐位选项
- [ ] 置顶位选项
- [ ] 价格显示
- [ ] 选中状态

### 3.2 区域选择器
- [ ] 创建 `components/order/RegionSelector.tsx`
- [ ] 省级推广选项
- [ ] 市级推广选项
- [ ] 区县推广选项
- [ ] 价格显示
- [ ] 根据设备位置默认选中

### 3.3 时长选择器
- [ ] 创建 `components/order/DurationSelector.tsx`
- [ ] 1-12个月选项
- [ ] 自定义月数输入
- [ ] 选中状态

### 3.4 价格计算器
- [ ] 创建 `components/order/PriceCalculator.tsx`
- [ ] 单价显示
- [ ] 时长显示
- [ ] 总价计算
- [ ] 优惠显示（如有）
- [ ] 应付金额显示

### 3.5 订单卡片
- [ ] 创建 `components/order/OrderCard.tsx`
- [ ] 设备图片
- [ ] 设备型号
- [ ] 订单号
- [ ] 推广信息
- [ ] 价格信息
- [ ] 状态徽章
- [ ] 操作按钮

### 3.6 订单详情
- [ ] 创建 `components/order/OrderDetail.tsx`
- [ ] 订单信息区块
- [ ] 设备信息区块
- [ ] 推广信息区块
- [ ] 支付信息区块

## Phase 4: 支付组件 (优先级: P0)

### 4.1 支付方式选择器
- [ ] 创建 `components/payment/PaymentSelector.tsx`
- [ ] 微信支付选项
- [ ] 支付宝支付选项
- [ ] 余额支付选项
- [ ] 余额显示
- [ ] 余额不足提示
- [ ] 去充值按钮

### 4.2 二维码支付
- [ ] 创建 `components/payment/QRCodePay.tsx`
- [ ] 二维码显示
- [ ] 金额显示
- [ ] 支付提示
- [ ] 倒计时（15分钟）
- [ ] 过期提示
- [ ] 支付状态提示

### 4.3 余额支付
- [ ] 创建 `components/payment/BalancePay.tsx`
- [ ] 当前余额显示
- [ ] 支付金额显示
- [ ] 余额不足提示
- [ ] 确认支付按钮

### 4.4 支付状态
- [ ] 创建 `components/payment/PaymentStatus.tsx`
- [ ] 支付中状态
- [ ] 支付成功状态
- [ ] 支付失败状态
- [ ] 支付超时状态

## Phase 5: 充值组件 (优先级: P0)

### 5.1 金额选择器
- [ ] 创建 `components/recharge/AmountSelector.tsx`
- [ ] 预设金额选项（100/200/500/1000）
- [ ] 自定义金额输入
- [ ] 金额验证（1-10000）
- [ ] 选中状态

### 5.2 充值记录列表
- [ ] 创建 `components/recharge/RechargeList.tsx`
- [ ] 充值订单号
- [ ] 充值金额
- [ ] 赠送金额
- [ ] 支付方式
- [ ] 充值状态
- [ ] 充值时间

## Phase 6: 订单创建页面 (优先级: P0)

### 6.1 页面创建
- [ ] 创建 `app/orders/create/page.tsx`
- [ ] 实现页面布局
- [ ] 集成面包屑导航

### 6.2 设备信息加载
- [ ] 从URL获取equipmentId
- [ ] 调用equipmentApi.getDetail
- [ ] 显示设备信息
- [ ] 加载状态
- [ ] 错误处理

### 6.3 表单集成
- [ ] 集成RankSelector
- [ ] 集成RegionSelector
- [ ] 集成DurationSelector
- [ ] 集成PriceCalculator

### 6.4 订单创建
- [ ] 实现handleSubmit
- [ ] 调用orderApi.create
- [ ] 成功后跳转支付页面
- [ ] 错误处理

### 6.5 权限验证
- [ ] 检查登录状态
- [ ] 检查是否为设备所有者
- [ ] 检查设备状态

## Phase 7: 支付页面 (优先级: P0)

### 7.1 页面创建
- [ ] 创建 `app/orders/[id]/pay/page.tsx`
- [ ] 实现页面布局
- [ ] 集成面包屑导航

### 7.2 订单信息加载
- [ ] 从URL获取orderId
- [ ] 调用orderApi.getDetail
- [ ] 显示订单信息
- [ ] 加载状态
- [ ] 错误处理

### 7.3 支付方式选择
- [ ] 集成PaymentSelector
- [ ] 获取用户余额
- [ ] 检查余额是否充足

### 7.4 支付处理
- [ ] 实现handlePay
- [ ] 调用orderApi.pay
- [ ] 余额支付：直接成功跳转
- [ ] 第三方支付：显示二维码

### 7.5 支付状态轮询
- [ ] 实现startPolling
- [ ] 每3秒检查一次
- [ ] 最多轮询100次（5分钟）
- [ ] 支付成功后停止并跳转
- [ ] 超时提示

### 7.6 二维码展示
- [ ] 集成QRCodePay组件
- [ ] 显示支付二维码
- [ ] 显示倒计时
- [ ] 显示支付提示

## Phase 8: 订单列表页面 (优先级: P0)

### 8.1 页面创建
- [ ] 创建 `app/orders/page.tsx`
- [ ] 实现页面布局
- [ ] 添加标题

### 8.2 状态筛选
- [ ] 实现Tabs组件
- [ ] 全部/待支付/已支付/已退款/已取消
- [ ] 切换时重新加载数据

### 8.3 订单列表
- [ ] 创建 `components/order/OrderList.tsx`
- [ ] 调用orderApi.getList
- [ ] 显示订单卡片
- [ ] 加载状态
- [ ] 空状态

### 8.4 分页功能
- [ ] 集成Pagination组件
- [ ] 每页20条
- [ ] 页码切换

### 8.5 操作功能
- [ ] 实现handlePay（跳转支付页面）
- [ ] 实现handleRefund（申请退款）
- [ ] 实现handleCancel（取消订单）
- [ ] 操作成功后刷新列表

## Phase 9: 订单详情页面 (优先级: P0)

### 9.1 页面创建
- [ ] 创建 `app/orders/[id]/page.tsx`
- [ ] 实现页面布局
- [ ] 集成面包屑导航

### 9.2 订单信息加载
- [ ] 从URL获取orderId
- [ ] 调用orderApi.getDetail
- [ ] 显示订单详情
- [ ] 加载状态
- [ ] 错误处理

### 9.3 详情展示
- [ ] 集成OrderDetail组件
- [ ] 订单信息区块
- [ ] 设备信息区块
- [ ] 推广信息区块
- [ ] 支付信息区块

### 9.4 操作按钮
- [ ] 去支付按钮（待支付）
- [ ] 申请退款按钮（已支付）
- [ ] 取消订单按钮（待支付）

## Phase 10: 充值页面优化 (优先级: P0)

### 10.1 页面优化
- [ ] 优化 `app/recharge/page.tsx`
- [ ] 显示当前余额
- [ ] 集成AmountSelector
- [ ] 显示优惠提示

### 10.2 支付方式选择
- [ ] 集成PaymentSelector（隐藏余额选项）
- [ ] 微信/支付宝选择

### 10.3 充值处理
- [ ] 实现handleRecharge
- [ ] 调用rechargeApi.create
- [ ] 显示二维码
- [ ] 轮询充值状态

### 10.4 充值记录入口
- [ ] 添加"查看充值记录"按钮
- [ ] 跳转充值记录页面

## Phase 11: 充值记录页面 (优先级: P1)

### 11.1 页面创建
- [ ] 创建 `app/recharge/history/page.tsx`
- [ ] 实现页面布局
- [ ] 添加标题

### 11.2 记录列表
- [ ] 集成RechargeList组件
- [ ] 调用rechargeApi.getHistory
- [ ] 显示充值记录
- [ ] 加载状态
- [ ] 空状态

### 11.3 分页功能
- [ ] 集成Pagination组件
- [ ] 每页20条
- [ ] 页码切换

## Phase 12: 退款功能 (优先级: P1)

### 12.1 退款Modal
- [ ] 创建退款确认Modal
- [ ] 退款原因输入（5-200字符）
- [ ] 退款金额显示
- [ ] 退款说明

### 12.2 退款处理
- [ ] 实现handleRefund
- [ ] 调用orderApi.refund
- [ ] 成功提示
- [ ] 刷新订单状态

### 12.3 退款限制
- [ ] 检查订单状态
- [ ] 只允许已支付订单退款

## Phase 13: 状态管理 (优先级: P1)

### 13.1 订单Store
- [ ] 创建 `lib/store/orderStore.ts`
- [ ] 当前订单状态
- [ ] 订单列表缓存
- [ ] 筛选条件状态

### 13.2 支付状态
- [ ] 支付中状态
- [ ] 支付结果状态
- [ ] 轮询控制

## Phase 14: 测试和优化 (优先级: P1)

### 14.1 功能测试
- [ ] 测试订单创建流程
- [ ] 测试余额支付流程
- [ ] 测试第三方支付流程
- [ ] 测试退款流程
- [ ] 测试充值流程
- [ ] 测试订单列表筛选
- [ ] 测试分页功能

### 14.2 边界测试
- [ ] 测试余额不足
- [ ] 测试支付超时
- [ ] 测试订单已支付
- [ ] 测试退款限制
- [ ] 测试权限验证

### 14.3 性能优化
- [ ] 轮询优化（指数退避）
- [ ] 列表分页优化
- [ ] 图片懒加载
- [ ] 缓存策略

### 14.4 用户体验优化
- [ ] 加载状态优化
- [ ] 错误提示优化
- [ ] 支付流程引导
- [ ] 移动端适配

## 依赖安装

```bash
cd frontend
npm install qrcode
npm install @types/qrcode -D
```

## 验收标准

### Phase 1-2 验收（基础）
- [ ] 类型定义完整
- [ ] 工具函数正常
- [ ] API调用正常

### Phase 3-5 验收（组件）
- [ ] 所有组件正常显示
- [ ] 交互功能正常
- [ ] 价格计算正确
- [ ] 支付方式选择正常

### Phase 6-7 验收（订单创建和支付）
- [ ] 订单创建成功
- [ ] 支付页面正常
- [ ] 余额支付成功
- [ ] 二维码支付显示正常
- [ ] 支付轮询正常

### Phase 8-9 验收（订单管理）
- [ ] 订单列表正常显示
- [ ] 状态筛选正常
- [ ] 分页功能正常
- [ ] 订单详情正常显示
- [ ] 操作功能正常

### Phase 10-11 验收（充值）
- [ ] 充值页面正常
- [ ] 金额选择正常
- [ ] 优惠计算正确
- [ ] 充值记录正常显示

### Phase 12 验收（退款）
- [ ] 退款申请正常
- [ ] 退款处理成功
- [ ] 退款限制正确

### Phase 13-14 验收（优化）
- [ ] 状态管理正常
- [ ] 所有功能测试通过
- [ ] 性能满足要求
- [ ] 用户体验良好

## 预计工时

- Phase 1: 2小时（类型和工具）
- Phase 2: 2小时（API集成）
- Phase 3: 4小时（基础组件）
- Phase 4: 4小时（支付组件）
- Phase 5: 2小时（充值组件）
- Phase 6: 3小时（订单创建页面）
- Phase 7: 4小时（支付页面）
- Phase 8: 3小时（订单列表页面）
- Phase 9: 2小时（订单详情页面）
- Phase 10: 2小时（充值页面优化）
- Phase 11: 2小时（充值记录页面）
- Phase 12: 2小时（退款功能）
- Phase 13: 2小时（状态管理）
- Phase 14: 3小时（测试和优化）

**总计: 37小时（约5个工作日）**

## 开发顺序建议

1. **第一天**：Phase 1-3（基础+组件）
2. **第二天**：Phase 4-5（支付+充值组件）
3. **第三天**：Phase 6-7（订单创建+支付页面）
4. **第四天**：Phase 8-10（订单管理+充值优化）
5. **第五天**：Phase 11-14（充值记录+退款+测试优化）
