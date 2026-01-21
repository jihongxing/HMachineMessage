# 用户认证模块 - 需求文档

## 功能范围

### 1. 手机号注册
- 发送短信验证码
- 验证码校验
- 强制设置密码（6-20位，字母+数字）
- 自动登录

### 2. 登录方式
- 密码登录（主要方式）
- 验证码登录（备用）
- 微信快捷登录（可选）

### 3. 找回密码
- 短信验证码验证
- 重置密码

### 4. 安全机制
- 验证码限流：60秒/次，10次/天/手机号，50次/天/IP
- 密码登录失败5次锁定30分钟
- 图形验证码（连续失败3次后显示）
- JWT Token认证

## 数据模型

### User表
- id, phone, password, nickname, avatar
- userLevel, status
- createdAt, updatedAt, lastLogin

### SmsCode表
- id, phone, code, type
- ipAddress, isUsed, expireAt

## API接口

1. POST /api/v1/auth/sms/send - 发送验证码
2. POST /api/v1/auth/register - 注册
3. POST /api/v1/auth/login - 密码登录
4. POST /api/v1/auth/login/sms - 验证码登录
5. POST /api/v1/auth/password/reset - 找回密码
6. POST /api/v1/auth/wechat/login - 微信登录

## 验收标准

- 注册流程完整可用
- 密码登录成功率 > 99%
- 验证码发送成功率 > 95%
- 限流机制生效
- Token认证正常
