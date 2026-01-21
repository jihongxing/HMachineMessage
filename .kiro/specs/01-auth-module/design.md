# 用户认证模块 - 设计文档

## 技术方案

### 1. 验证码服务
```typescript
class SmsService {
  async sendCode(phone: string, type: string): Promise<void>
  async verifyCode(phone: string, code: string, type: string): Promise<boolean>
}
```

**限流策略**：
- Redis存储：`sms:${phone}:count` - 手机号计数
- Redis存储：`sms:${ip}:count` - IP计数
- TTL：24小时

### 2. 密码加密
- bcrypt加密，SALT_ROUNDS=10
- 密码强度校验：Zod schema

### 3. JWT Token
```typescript
interface JwtPayload {
  userId: string;
  userLevel: number;
}
```
- 有效期：7天
- 存储位置：客户端localStorage
- 传输方式：Authorization: Bearer {token}

### 4. 登录失败锁定
- Redis存储：`login:fail:${phone}` - 失败次数
- 5次失败后锁定30分钟
- TTL：30分钟

## 数据流

### 注册流程
```
1. 用户输入手机号 → 发送验证码
2. 验证码校验 → 输入密码
3. 创建用户 → 生成Token → 返回
```

### 登录流程
```
1. 输入手机号+密码
2. 查询用户 → 验证密码
3. 检查失败次数 → 生成Token → 返回
```

## 错误处理

- 400: 参数错误
- 401: 认证失败
- 429: 请求过于频繁
- 500: 服务器错误

## 性能优化

- Redis缓存验证码（5分钟过期）
- 密码加密异步处理
- 数据库查询索引优化（phone字段）
