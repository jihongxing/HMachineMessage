# 用户中心模块 - 设计文档

## 架构设计

### 目录结构

```
frontend/src/
├── app/
│   └── profile/
│       ├── page.tsx                  # 个人中心首页
│       ├── edit/
│       │   └── page.tsx              # 编辑资料
│       ├── password/
│       │   └── page.tsx              # 修改密码
│       ├── verify/
│       │   ├── realname/
│       │   │   └── page.tsx          # 实名认证
│       │   └── company/
│       │       └── page.tsx          # 企业认证
│       ├── transactions/
│       │   └── page.tsx              # 消费记录
│       └── equipment/
│           └── page.tsx              # 我的设备（已在13模块）
├── components/
│   └── profile/
│       ├── UserInfo.tsx              # 用户信息卡片
│       ├── AccountInfo.tsx           # 账户信息卡片
│       ├── QuickLinks.tsx            # 快捷入口
│       ├── UserLevel.tsx             # 用户等级组件
│       ├── VerifyStatus.tsx          # 认证状态组件
│       ├── BalanceCard.tsx           # 余额卡片
│       └── TransactionList.tsx       # 交易记录列表
└── lib/
    └── api/endpoints/
        └── user.ts                   # 用户API
```

## 详细设计

### 1. 个人中心首页

```typescript
// app/profile/page.tsx
export default function ProfilePage() {
  const { user, updateUser } = useUserStore();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    // 加载用户统计数据
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    const [equipmentStats, orderStats] = await Promise.all([
      equipmentApi.myList({ page: 1, pageSize: 1 }),
      orderApi.getList({ page: 1, pageSize: 1 }),
    ]);
    
    setStats({
      equipmentCount: equipmentStats.total,
      orderCount: orderStats.total,
    });
  };

  return (
    <Container>
      <h1>个人中心</h1>

      {/* 用户信息卡片 */}
      <UserInfo user={user} />

      {/* 账户信息卡片 */}
      <AccountInfo
        balance={user?.balance}
        publishCount={user?.publishCount}
        passCount={user?.passCount}
        violationCount={user?.violationCount}
      />

      {/* 用户等级 */}
      <UserLevel level={user?.userLevel} />

      {/* 认证状态 */}
      <VerifyStatus
        realName={user?.realName}
        companyName={user?.companyName}
      />

      {/* 快捷入口 */}
      <QuickLinks stats={stats} />
    </Container>
  );
}
```

### 2. 用户信息卡片

```typescript
// components/profile/UserInfo.tsx
interface UserInfoProps {
  user: User | null;
}

export default function UserInfo({ user }: UserInfoProps) {
  return (
    <Card className="flex items-center gap-4">
      {/* 头像 */}
      <Avatar
        src={user?.avatar}
        alt={user?.nickname}
        size="lg"
      />

      {/* 信息 */}
      <div className="flex-1">
        <h2>{user?.nickname}</h2>
        <p className="text-gray-600">{user?.phone}</p>
        <div className="flex gap-2 mt-2">
          <Badge>{getUserLevelText(user?.userLevel)}</Badge>
          {user?.realName && <Badge variant="success">实名认证</Badge>}
          {user?.companyName && <Badge variant="success">企业认证</Badge>}
        </div>
      </div>

      {/* 编辑按钮 */}
      <Button
        variant="outline"
        onClick={() => router.push('/profile/edit')}
      >
        编辑资料
      </Button>
    </Card>
  );
}
```

### 3. 账户信息卡片

```typescript
// components/profile/AccountInfo.tsx
interface AccountInfoProps {
  balance?: number;
  publishCount?: number;
  passCount?: number;
  violationCount?: number;
}

export default function AccountInfo({
  balance = 0,
  publishCount = 0,
  passCount = 0,
  violationCount = 0
}: AccountInfoProps) {
  return (
    <Card>
      <h3>账户信息</h3>
      
      <div className="grid grid-cols-4 gap-4 mt-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">¥{balance}</p>
          <p className="text-sm text-gray-600">账户余额</p>
          <Button
            size="sm"
            variant="link"
            onClick={() => router.push('/recharge')}
          >
            充值
          </Button>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold">{publishCount}</p>
          <p className="text-sm text-gray-600">发布数量</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{passCount}</p>
          <p className="text-sm text-gray-600">通过数量</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{violationCount}</p>
          <p className="text-sm text-gray-600">违规数量</p>
        </div>
      </div>
    </Card>
  );
}
```

### 4. 快捷入口

```typescript
// components/profile/QuickLinks.tsx
interface QuickLinksProps {
  stats?: {
    equipmentCount?: number;
    orderCount?: number;
  };
}

export default function QuickLinks({ stats }: QuickLinksProps) {
  const links = [
    { icon: '📦', label: '我的设备', href: '/profile/equipment', count: stats?.equipmentCount },
    { icon: '📋', label: '我的订单', href: '/orders', count: stats?.orderCount },
    { icon: '❤️', label: '我的收藏', href: '/favorites' },
    { icon: '👁️', label: '浏览历史', href: '/history' },
    { icon: '💰', label: '充值', href: '/recharge' },
    { icon: '📊', label: '消费记录', href: '/profile/transactions' },
    { icon: '🔒', label: '修改密码', href: '/profile/password' },
    { icon: '✅', label: '实名认证', href: '/profile/verify/realname' },
  ];

  return (
    <Card>
      <h3>快捷入口</h3>
      
      <div className="grid grid-cols-4 gap-4 mt-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="quick-link"
          >
            <span className="text-3xl">{link.icon}</span>
            <span className="text-sm">{link.label}</span>
            {link.count !== undefined && (
              <Badge className="absolute top-0 right-0">
                {link.count}
              </Badge>
            )}
          </Link>
        ))}
      </div>
    </Card>
  );
}
```

### 5. 编辑资料页面

```typescript
// app/profile/edit/page.tsx
export default function ProfileEditPage() {
  const { user, updateUser } = useUserStore();
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!nickname || nickname.length < 2 || nickname.length > 20) {
      showToast({ type: 'error', message: '昵称长度为2-20字符' });
      return;
    }

    setLoading(true);
    try {
      await userApi.updateProfile({ nickname, avatar });
      updateUser({ nickname, avatar });
      showToast({ type: 'success', message: '更新成功' });
      router.back();
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1>编辑资料</h1>

      <Card>
        {/* 头像上传 */}
        <div className="form-item">
          <label>头像</label>
          <Upload
            value={avatar ? [avatar] : []}
            onChange={(urls) => setAvatar(urls[0])}
            maxCount={1}
            accept="image/*"
          />
        </div>

        {/* 昵称 */}
        <div className="form-item">
          <label>昵称</label>
          <Input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
          />
          <p className="text-sm text-gray-600">
            {nickname.length}/20
          </p>
        </div>

        {/* 手机号（不可修改） */}
        <div className="form-item">
          <label>手机号</label>
          <Input
            value={user?.phone}
            disabled
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
          >
            保存修改
          </Button>
        </div>
      </Card>
    </Container>
  );
}
```

### 6. 修改密码页面

```typescript
// app/profile/password/page.tsx
export default function PasswordPage() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => {
    return getPasswordStrength(newPassword);
  }, [newPassword]);

  const handleSubmit = async () => {
    // 验证
    if (!oldPassword) {
      showToast({ type: 'error', message: '请输入原密码' });
      return;
    }

    if (!newPassword || newPassword.length < 6 || newPassword.length > 20) {
      showToast({ type: 'error', message: '新密码长度为6-20字符' });
      return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]/.test(newPassword)) {
      showToast({ type: 'error', message: '密码必须包含字母和数字' });
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: '两次密码输入不一致' });
      return;
    }

    setLoading(true);
    try {
      await userApi.changePassword({ oldPassword, newPassword });
      showToast({ type: 'success', message: '密码修改成功，请重新登录' });
      // 清除登录状态
      logout();
      router.push('/auth/login');
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1>修改密码</h1>

      <Card>
        {/* 原密码 */}
        <div className="form-item">
          <label>原密码</label>
          <Input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="请输入原密码"
          />
        </div>

        {/* 新密码 */}
        <div className="form-item">
          <label>新密码</label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="请输入新密码"
          />
          {newPassword && (
            <div className="password-strength">
              <span className={`strength-${passwordStrength}`}>
                {passwordStrength === 'weak' && '弱'}
                {passwordStrength === 'medium' && '中'}
                {passwordStrength === 'strong' && '强'}
              </span>
            </div>
          )}
          <p className="text-sm text-gray-600">
            6-20字符，必须包含字母和数字
          </p>
        </div>

        {/* 确认密码 */}
        <div className="form-item">
          <label>确认新密码</label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="请再次输入新密码"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
          >
            确认修改
          </Button>
        </div>
      </Card>
    </Container>
  );
}
```

### 7. 实名认证页面

```typescript
// app/profile/verify/realname/page.tsx
export default function RealnameVerifyPage() {
  const [realName, setRealName] = useState('');
  const [idCard, setIdCard] = useState('');
  const [idCardFront, setIdCardFront] = useState('');
  const [idCardBack, setIdCardBack] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 验证
    if (!realName || realName.length < 2 || realName.length > 20) {
      showToast({ type: 'error', message: '请输入真实姓名' });
      return;
    }

    if (!isValidIdCard(idCard)) {
      showToast({ type: 'error', message: '请输入正确的身份证号' });
      return;
    }

    if (!idCardFront || !idCardBack) {
      showToast({ type: 'error', message: '请上传身份证照片' });
      return;
    }

    setLoading(true);
    try {
      await userApi.verifyRealName({
        realName,
        idCard,
        idCardFront,
        idCardBack,
      });
      showToast({ type: 'success', message: '实名认证成功' });
      router.push('/profile');
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <h1>实名认证</h1>

      {/* 认证说明 */}
      <Card className="bg-blue-50">
        <h3>认证说明</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• 实名认证后可提升用户等级，享受更多权益</li>
          <li>• 您的信息将被加密保存，仅用于身份验证</li>
          <li>• 认证通过后不可修改</li>
        </ul>
      </Card>

      <Card>
        {/* 真实姓名 */}
        <div className="form-item">
          <label>真实姓名</label>
          <Input
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            placeholder="请输入真实姓名"
            maxLength={20}
          />
        </div>

        {/* 身份证号 */}
        <div className="form-item">
          <label>身份证号</label>
          <Input
            value={idCard}
            onChange={(e) => setIdCard(e.target.value)}
            placeholder="请输入身份证号"
            maxLength={18}
          />
        </div>

        {/* 身份证正面 */}
        <div className="form-item">
          <label>身份证正面</label>
          <Upload
            value={idCardFront ? [idCardFront] : []}
            onChange={(urls) => setIdCardFront(urls[0])}
            maxCount={1}
            accept="image/*"
          />
          <p className="text-sm text-gray-600">
            请上传身份证人像面照片
          </p>
        </div>

        {/* 身份证反面 */}
        <div className="form-item">
          <label>身份证反面</label>
          <Upload
            value={idCardBack ? [idCardBack] : []}
            onChange={(urls) => setIdCardBack(urls[0])}
            maxCount={1}
            accept="image/*"
          />
          <p className="text-sm text-gray-600">
            请上传身份证国徽面照片
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
          >
            提交认证
          </Button>
        </div>
      </Card>
    </Container>
  );
}
```

### 8. 消费记录页面

```typescript
// app/profile/transactions/page.tsx
export default function TransactionsPage() {
  const [type, setType] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
  const [page, setPage] = useState(1);
  const { data, loading } = useTransactions({ type, dateRange, page });

  return (
    <Container>
      <h1>消费记录</h1>

      {/* 筛选 */}
      <Card>
        <div className="flex gap-4">
          {/* 类型筛选 */}
          <Select
            value={type}
            onChange={setType}
            options={[
              { label: '全部', value: undefined },
              { label: '充值', value: 'recharge' },
              { label: '消费', value: 'consume' },
              { label: '退款', value: 'refund' },
            ]}
          />

          {/* 时间筛选 */}
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            presets={[
              { label: '近7天', value: [subDays(new Date(), 7), new Date()] },
              { label: '近30天', value: [subDays(new Date(), 30), new Date()] },
              { label: '近3个月', value: [subMonths(new Date(), 3), new Date()] },
            ]}
          />
        </div>
      </Card>

      {/* 交易记录列表 */}
      <TransactionList
        transactions={data?.list}
        loading={loading}
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

### 9. 工具函数

```typescript
// lib/utils/user.ts
export function getUserLevelText(level?: number): string {
  const map: Record<number, string> = {
    0: '新用户',
    1: '普通用户',
    2: '优质用户',
    3: '认证用户',
  };
  return map[level || 0] || '未知';
}

export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (!password) return 'weak';
  
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (hasLetter && hasNumber && hasSpecial) return 'strong';
  if (hasLetter && hasNumber) return 'medium';
  return 'weak';
}

export function isValidIdCard(idCard: string): boolean {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
}
```

## 数据流设计

### 个人信息更新流程

```
编辑资料 →
上传头像（可选） →
修改昵称 →
提交更新 →
更新Store →
返回个人中心
```

### 密码修改流程

```
输入原密码 →
输入新密码 →
确认新密码 →
提交修改 →
清除登录状态 →
跳转登录页
```

### 实名认证流程

```
填写姓名和身份证号 →
上传身份证照片 →
提交认证 →
后端验证 →
更新用户等级 →
返回个人中心
```

## 性能优化

### 1. 图片优化
- 头像压缩
- 身份证照片压缩
- 懒加载

### 2. 数据缓存
- 用户信息缓存
- 统计数据缓存

## 错误处理

### 1. 表单验证错误
- 实时验证
- 错误提示

### 2. 上传错误
- 文件格式错误
- 文件大小错误
- 网络错误

### 3. 认证错误
- 信息格式错误
- 认证失败
- 重复认证
