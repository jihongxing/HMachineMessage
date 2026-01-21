# 用户中心模块 - 设计文档

## 技术方案

### 1. 用户服务
```typescript
class UserService {
  async getProfile(userId: bigint): Promise<UserProfile>
  async updateProfile(userId: bigint, data: UpdateProfileDto): Promise<void>
  async changePassword(userId: bigint, oldPassword: string, newPassword: string): Promise<void>
  async changePhone(userId: bigint, newPhone: string, code: string): Promise<void>
}
```

### 2. 认证服务
```typescript
class VerificationService {
  async realnameVerify(userId: bigint, data: RealnameDto): Promise<void>
  async companyVerify(userId: bigint, data: CompanyDto): Promise<void>
}
```

**认证流程**：
- 提交认证信息
- 调用第三方实名认证API
- 更新用户等级
- 发送认证通知

### 3. 账户服务
```typescript
class AccountService {
  async getBalance(userId: bigint): Promise<number>
  async getTransactions(userId: bigint, pagination): Promise<PaginationResult>
  async withdraw(userId: bigint, amount: number): Promise<void>
}
```

## 数据流

### 修改密码流程
```
1. 验证旧密码
2. 校验新密码强度
3. 加密新密码
4. 更新数据库
5. 清除所有Token（强制重新登录）
```

### 更换手机号流程
```
1. 发送验证码到新手机号
2. 验证验证码
3. 检查新手机号是否已注册
4. 更新手机号
5. 发送通知
```

## 缓存策略

```typescript
// 用户资料缓存
cache.set(`user:profile:${userId}`, data, 600);

// 余额缓存
cache.set(`user:balance:${userId}`, balance, 60);
```

## 安全机制

- 修改密码需验证旧密码
- 更换手机号需验证码
- 敏感操作记录日志
- 身份证号加密存储
