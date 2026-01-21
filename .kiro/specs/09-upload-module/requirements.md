# 文件上传模块 - 需求文档

## 功能范围

### 1. 图片上传
- 支持格式：JPG/PNG/WebP
- 单张限制：< 5MB
- 总量限制：< 30MB
- 数量限制：3-9张

### 2. 图片处理
- 前端压缩（< 2MB）
- 后端二次压缩（< 200KB）
- 格式转换（WebP）
- 尺寸调整

### 3. 存储方案
- 对象存储（MinIO/阿里云OSS/七牛云）
- CDN加速
- 图片URL生成

### 4. 上传凭证
- 临时上传Token
- 有效期：1小时
- 权限控制

### 5. 图片管理
- 上传记录
- 图片删除
- 存储统计

## 数据模型

### Image表
- id, userId, key, url
- size, width, height, mimeType
- uploadedAt

## API接口

1. GET /api/v1/upload/token - 获取上传凭证
2. POST /api/v1/upload - 上传文件
3. DELETE /api/v1/upload/:key - 删除文件
4. GET /api/v1/user/images - 我的图片

## 技术方案

### 上传流程
```
1. 前端请求上传凭证
2. 前端压缩图片
3. 直传对象存储
4. 返回图片URL
5. 记录上传信息
```

### 图片处理
- Sharp库压缩
- WebP格式转换
- 缩略图生成

## 验收标准

- 上传成功率 > 95%
- 图片压缩率 > 60%
- CDN加速生效
- 上传速度快
