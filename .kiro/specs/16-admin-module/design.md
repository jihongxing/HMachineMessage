# 后台管理模块 - 设计文档

## 架构设计

### 目录结构

```
frontend/src/
├── app/
│   └── admin/
│       ├── layout.tsx                # 后台布局
│       ├── page.tsx                  # 数据概览
│       ├── audit/
│       │   └── page.tsx              # 设备审核
│       ├── users/
│       │   └── page.tsx              # 用户管理
│       ├── reports/
│       │   └── page.tsx              # 举报管理
│       └── stats/
│           └── page.tsx              # 数据统计
├── components/
│   └── admin/
│       ├── AdminSidebar.tsx          # 侧边栏
│       ├── AdminHeader.tsx           # 顶部栏
│       ├── StatsCard.tsx             # 统计卡片
│       ├── AuditList.tsx             # 审核列表
│       ├── AuditModal.tsx            # 审核详情
│       ├── UserList.tsx              # 用户列表
│       ├── UserModal.tsx             # 用户详情
│       ├── ReportList.tsx            # 举报列表
│       ├── ReportModal.tsx           # 举报详情
│       └── Charts.tsx                # 图表组件
└── lib/
    └── api/endpoints/
        └── admin.ts                  # 管理API
```

## 详细设计

### 1. 后台布局

```typescript
// app/admin/layout.tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    // 检查管理员权限
    if (!user || user.userLevel < 3) {
      router.push('/');
    }
  }, [user]);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main">
        <AdminHeader />
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 2. 侧边栏

```typescript
// components/admin/AdminSidebar.tsx
export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { icon: '📊', label: '数据概览', href: '/admin' },
    { icon: '✅', label: '设备审核', href: '/admin/audit', badge: 5 },
    { icon: '👥', label: '用户管理', href: '/admin/users' },
    { icon: '🚨', label: '举报管理', href: '/admin/reports', badge: 2 },
    { icon: '📈', label: '数据统计', href: '/admin/stats' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="logo">管理后台</div>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? 'active' : ''}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
            {item.badge && <Badge>{item.badge}</Badge>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

### 3. 数据概览页面

```typescript
// app/admin/page.tsx
export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getStats();
      setStats(data);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <Container>
      <h1>数据概览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <StatsCard
          title="用户总数"
          value={stats.users.total}
          trend={`+${stats.users.new}`}
          icon="👥"
        />
        <StatsCard
          title="设备总数"
          value={stats.equipment.total}
          trend={`+${stats.equipment.new}`}
          icon="📦"
        />
        <StatsCard
          title="待审核"
          value={stats.equipment.pending}
          icon="⏳"
          color="warning"
        />
        <StatsCard
          title="订单金额"
          value={`¥${stats.orders.amount}`}
          icon="💰"
          color="success"
        />
      </div>

      {/* 图表 */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Card>
          <h3>用户增长趋势</h3>
          <LineChart data={stats.userTrend} />
        </Card>
        <Card>
          <h3>设备发布趋势</h3>
          <LineChart data={stats.equipmentTrend} />
        </Card>
      </div>

      {/* 快捷入口 */}
      <Card className="mt-6">
        <h3>快捷操作</h3>
        <div className="flex gap-4">
          <Button onClick={() => router.push('/admin/audit')}>
            待审核设备 ({stats.equipment.pending})
          </Button>
          <Button onClick={() => router.push('/admin/reports')}>
            待处理举报
          </Button>
        </div>
      </Card>
    </Container>
  );
}
```

### 4. 设备审核页面

```typescript
// app/admin/audit/page.tsx
export default function AuditPage() {
  const [riskScore, setRiskScore] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const { data, loading, refetch } = usePendingList({ riskScore, page });

  const handleAudit = async (id: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await adminApi.auditEquipment(id, action, reason);
      showToast({ type: 'success', message: '审核成功' });
      refetch();
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    }
  };

  const handleBatchAudit = async (action: 'approve' | 'reject') => {
    if (!selectedIds.length) {
      showToast({ type: 'warning', message: '请选择要审核的设备' });
      return;
    }

    try {
      await Promise.all(
        selectedIds.map((id) => adminApi.auditEquipment(id, action))
      );
      showToast({ type: 'success', message: '批量审核成功' });
      setSelectedIds([]);
      refetch();
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    }
  };

  return (
    <Container>
      <div className="flex justify-between items-center">
        <h1>设备审核</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleBatchAudit('approve')}
            disabled={!selectedIds.length}
          >
            批量通过
          </Button>
          <Button
            variant="outline"
            onClick={() => handleBatchAudit('reject')}
            disabled={!selectedIds.length}
          >
            批量拒绝
          </Button>
        </div>
      </div>

      {/* 风险评分筛选 */}
      <Tabs
        value={riskScore}
        onChange={setRiskScore}
        items={[
          { label: '全部', value: undefined },
          { label: '高风险(60-100)', value: '60-100' },
          { label: '中风险(20-60)', value: '20-60' },
          { label: '低风险(0-20)', value: '0-20' },
        ]}
      />

      {/* 审核列表 */}
      <AuditList
        equipments={data?.list}
        loading={loading}
        selectedIds={selectedIds}
        onSelect={setSelectedIds}
        onAudit={handleAudit}
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

### 5. 审核列表组件

```typescript
// components/admin/AuditList.tsx
interface AuditListProps {
  equipments: Equipment[];
  loading: boolean;
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onAudit: (id: string, action: 'approve' | 'reject', reason?: string) => void;
}

export default function AuditList({
  equipments,
  loading,
  selectedIds,
  onSelect,
  onAudit
}: AuditListProps) {
  const [detailId, setDetailId] = useState<string | null>(null);

  if (loading) return <Loading />;
  if (!equipments?.length) return <Empty message="暂无待审核设备" />;

  return (
    <>
      <div className="space-y-4">
        {equipments.map((equipment) => (
          <Card key={equipment.id} className="flex gap-4">
            {/* 复选框 */}
            <Checkbox
              checked={selectedIds.includes(equipment.id)}
              onChange={(checked) => {
                if (checked) {
                  onSelect([...selectedIds, equipment.id]);
                } else {
                  onSelect(selectedIds.filter((id) => id !== equipment.id));
                }
              }}
            />

            {/* 设备图片 */}
            <img
              src={equipment.images[0]}
              alt={equipment.model}
              className="w-24 h-24 object-cover rounded"
            />

            {/* 设备信息 */}
            <div className="flex-1">
              <h3>{equipment.model}</h3>
              <p className="text-sm text-gray-600">
                发布用户：{equipment.user.nickname} ({equipment.user.phone})
              </p>
              <p className="text-sm text-gray-600">
                用户等级：{getUserLevelText(equipment.user.userLevel)} | 
                违规次数：{equipment.user.violationCount}
              </p>
              <p className="text-sm text-gray-600">
                提交时间：{formatDate(equipment.createdAt)}
              </p>
            </div>

            {/* 风险评分 */}
            <div className="text-center">
              <div className={`risk-score risk-${getRiskLevel(equipment.riskScore)}`}>
                {equipment.riskScore}
              </div>
              <p className="text-sm text-gray-600">风险评分</p>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDetailId(equipment.id)}
              >
                查看详情
              </Button>
              <Button
                size="sm"
                onClick={() => onAudit(equipment.id, 'approve')}
              >
                通过
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                onClick={() => {
                  const reason = prompt('请输入拒绝原因：');
                  if (reason) {
                    onAudit(equipment.id, 'reject', reason);
                  }
                }}
              >
                拒绝
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* 审核详情Modal */}
      {detailId && (
        <AuditModal
          equipmentId={detailId}
          onClose={() => setDetailId(null)}
          onAudit={onAudit}
        />
      )}
    </>
  );
}
```

### 6. 用户管理页面

```typescript
// app/admin/users/page.tsx
export default function UsersPage() {
  const [keyword, setKeyword] = useState('');
  const [userLevel, setUserLevel] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useUserList({ keyword, userLevel, status, page });

  const handleBan = async (userId: string) => {
    const reason = prompt('请输入封禁原因：');
    if (!reason) return;

    const duration = prompt('请输入封禁天数（留空为永久）：');

    try {
      await adminApi.updateUserStatus(userId, 'ban', reason, duration ? parseInt(duration) : undefined);
      showToast({ type: 'success', message: '封禁成功' });
      refetch();
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await adminApi.updateUserStatus(userId, 'unban');
      showToast({ type: 'success', message: '解封成功' });
      refetch();
    } catch (error) {
      showToast({ type: 'error', message: error.message });
    }
  };

  return (
    <Container>
      <h1>用户管理</h1>

      {/* 搜索筛选 */}
      <Card>
        <div className="flex gap-4">
          <Input
            placeholder="搜索手机号或昵称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            placeholder="用户等级"
            value={userLevel}
            onChange={setUserLevel}
            options={[
              { label: '全部', value: undefined },
              { label: '新用户', value: '0' },
              { label: '普通用户', value: '1' },
              { label: '优质用户', value: '2' },
              { label: '认证用户', value: '3' },
            ]}
          />
          <Select
            placeholder="状态"
            value={status}
            onChange={setStatus}
            options={[
              { label: '全部', value: undefined },
              { label: '正常', value: '0' },
              { label: '封禁', value: '1' },
            ]}
          />
        </div>
      </Card>

      {/* 用户列表 */}
      <UserList
        users={data?.list}
        loading={loading}
        onBan={handleBan}
        onUnban={handleUnban}
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

### 7. 数据统计页面

```typescript
// app/admin/stats/page.tsx
export default function StatsPage() {
  const [dateRange, setDateRange] = useState<[Date, Date]>([
    subDays(new Date(), 30),
    new Date()
  ]);
  const { data, loading } = useStats(dateRange);

  const handleExport = () => {
    // 导出Excel
    exportToExcel(data, 'statistics.xlsx');
  };

  return (
    <Container>
      <div className="flex justify-between items-center">
        <h1>数据统计</h1>
        <div className="flex gap-2">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
          />
          <Button onClick={handleExport}>
            导出数据
          </Button>
        </div>
      </div>

      {/* 用户统计 */}
      <Card>
        <h3>用户统计</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{data?.users.total}</p>
            <p className="text-sm text-gray-600">总用户数</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.users.new}</p>
            <p className="text-sm text-gray-600">新增用户</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.users.active}</p>
            <p className="text-sm text-gray-600">活跃用户</p>
          </div>
        </div>
      </Card>

      {/* 设备统计 */}
      <Card>
        <h3>设备统计</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{data?.equipment.total}</p>
            <p className="text-sm text-gray-600">总设备数</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.equipment.new}</p>
            <p className="text-sm text-gray-600">新增设备</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-warning">{data?.equipment.pending}</p>
            <p className="text-sm text-gray-600">待审核</p>
          </div>
        </div>
      </Card>

      {/* 交易统计 */}
      <Card>
        <h3>交易统计</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold">{data?.orders.total}</p>
            <p className="text-sm text-gray-600">订单总数</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">¥{data?.orders.amount}</p>
            <p className="text-sm text-gray-600">订单金额</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.orders.paid}</p>
            <p className="text-sm text-gray-600">已支付</p>
          </div>
        </div>
      </Card>

      {/* 审核统计 */}
      <Card>
        <h3>审核统计</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{data?.audit.total}</p>
            <p className="text-sm text-gray-600">审核总数</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.audit.auto}</p>
            <p className="text-sm text-gray-600">自动审核</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.audit.manual}</p>
            <p className="text-sm text-gray-600">人工审核</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{data?.audit.avgTime}s</p>
            <p className="text-sm text-gray-600">平均时间</p>
          </div>
        </div>
      </Card>
    </Container>
  );
}
```

## 数据流设计

### 审核流程

```
查看待审核列表 →
选择设备 →
查看详情 →
通过/拒绝 →
发送通知 →
刷新列表
```

### 封禁流程

```
查看用户列表 →
选择用户 →
填写封禁原因和时长 →
确认封禁 →
下架用户所有设备 →
发送通知 →
刷新列表
```

## 性能优化

### 1. 列表优化
- 分页加载
- 虚拟滚动（可选）
- 图片懒加载

### 2. 图表优化
- 数据缓存
- 按需加载
- 防抖渲染

## 错误处理

### 1. 权限错误
- 非管理员访问：跳转首页
- 权限不足：提示并返回

### 2. 操作错误
- 审核失败：提示原因
- 封禁失败：提示原因
- 网络错误：提示重试
