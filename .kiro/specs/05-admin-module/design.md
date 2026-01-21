# 后台管理模块 - 设计文档

## 技术方案

### 1. AI风险评分
```typescript
class RiskScoreCalculator {
  calculate(equipment: Equipment): number {
    let score = 0;
    
    // 敏感词检测
    if (hasSensitiveWords(equipment.description)) score += 20;
    
    // 图片数量检测
    if (equipment.images.length < 3) score += 15;
    
    // 描述长度检测
    if (!equipment.description || equipment.description.length < 50) score += 15;
    
    // 价格异常检测
    if (isPriceAbnormal(equipment.price, equipment.category2)) score += 20;
    
    // 用户信用检测
    if (equipment.user.violationCount > 0) score += 10;
    if (equipment.user.userLevel === 0) score += 10;
    
    return Math.min(100, score);
  }
}
```

### 2. 自动审核策略
```typescript
async function autoAudit(equipment: Equipment): Promise<boolean> {
  const riskScore = riskScoreCalculator.calculate(equipment);
  
  // 更新风险评分
  await prisma.equipment.update({
    where: { id: equipment.id },
    data: { riskScore },
  });
  
  // 低风险自动通过
  if (riskScore < 20) {
    await approveEquipment(equipment.id, null); // null表示自动审核
    return true;
  }
  
  // 高风险进入人工审核
  return false;
}
```

### 3. 用户等级升级
```typescript
async function checkUserLevelUpgrade(userId: bigint) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { equipment: true },
  });
  
  const passCount = user.equipment.filter(e => e.status === 1).length;
  
  // 新用户 → 普通用户
  if (user.userLevel === 0 && passCount >= 5) {
    await prisma.user.update({
      where: { id: userId },
      data: { userLevel: 1 },
    });
  }
  
  // 普通用户 → 优质用户
  if (user.userLevel === 1 && passCount >= 20 && user.violationCount === 0) {
    await prisma.user.update({
      where: { id: userId },
      data: { userLevel: 2 },
    });
  }
}
```

### 4. 审核服务
```typescript
class AuditService {
  async getPendingList(filters, pagination): Promise<PaginationResult> {
    return prisma.equipment.findMany({
      where: { status: 0 },
      orderBy: { riskScore: 'desc' }, // 高风险优先
      ...pagination,
    });
  }
  
  async approve(equipmentId: bigint, auditorId: bigint | null): Promise<void> {
    await prisma.$transaction([
      // 更新设备状态
      prisma.equipment.update({
        where: { id: equipmentId },
        data: { status: 1 },
      }),
      
      // 记录审核日志
      prisma.auditLog.create({
        data: {
          equipmentId,
          auditorId,
          action: 'approve',
        },
      }),
      
      // 发送通知
      // ...
    ]);
    
    // 检查用户等级升级
    await checkUserLevelUpgrade(equipment.userId);
  }
  
  async reject(equipmentId: bigint, auditorId: bigint, reason: string): Promise<void> {
    await prisma.$transaction([
      prisma.equipment.update({
        where: { id: equipmentId },
        data: { status: 2, rejectReason: reason },
      }),
      
      prisma.auditLog.create({
        data: {
          equipmentId,
          auditorId,
          action: 'reject',
          reason,
        },
      }),
    ]);
  }
}
```

### 5. 统计服务
```typescript
class StatsService {
  async getOverview(startDate: Date, endDate: Date): Promise<Stats> {
    const [users, equipment, orders, audits] = await Promise.all([
      this.getUserStats(startDate, endDate),
      this.getEquipmentStats(startDate, endDate),
      this.getOrderStats(startDate, endDate),
      this.getAuditStats(startDate, endDate),
    ]);
    
    return { users, equipment, orders, audits };
  }
}
```

## 缓存策略

```typescript
// 待审核数量缓存
cache.set('admin:pending:count', count, 60);

// 统计数据缓存
cache.set(`admin:stats:${date}`, data, 3600);
```

## 权限控制

```typescript
// 管理员角色
enum AdminRole {
  SUPER = 'super',    // 超级管理员
  AUDITOR = 'auditor', // 审核员
  SUPPORT = 'support', // 客服
}

// 权限中间件
const requireAdmin = (role?: AdminRole) => {
  return async (req, res, next) => {
    if (!req.adminId) {
      throw new UnauthorizedError();
    }
    
    if (role && req.adminRole !== role && req.adminRole !== AdminRole.SUPER) {
      throw new ForbiddenError();
    }
    
    next();
  };
};
```
