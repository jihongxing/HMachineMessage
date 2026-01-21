# 文件上传模块 - 设计文档

## 技术方案

### 1. 上传服务
```typescript
class UploadService {
  async generateToken(userId: bigint, type: string): Promise<UploadToken>
  async upload(file: File, token: string): Promise<UploadResult>
  async delete(key: string, userId: bigint): Promise<void>
  async getUserImages(userId: bigint, pagination): Promise<PaginationResult>
}
```

### 2. 存储提供者接口
```typescript
interface StorageProvider {
  upload(file: Buffer, key: string): Promise<string>
  delete(key: string): Promise<void>
  getUrl(key: string): string
}

class MinIOProvider implements StorageProvider {
  private client: Client;
  
  async upload(file: Buffer, key: string): Promise<string> {
    await this.client.putObject(bucket, key, file);
    return this.getUrl(key);
  }
  
  getUrl(key: string): string {
    return `${cdnUrl}/${key}`;
  }
}

class OSSProvider implements StorageProvider {}
class QiniuProvider implements StorageProvider {}
```

### 3. 图片处理
```typescript
import sharp from 'sharp';

async function processImage(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(400, 300, { fit: 'cover' })
    .webp({ quality: 70 })
    .toBuffer();
}
```

### 4. 上传凭证
```typescript
interface UploadToken {
  token: string;
  uploadUrl: string;
  expireAt: Date;
  maxSize: number;
  allowedTypes: string[];
}

function generateUploadToken(userId: bigint, type: string): UploadToken {
  const token = jwt.sign(
    { userId: userId.toString(), type },
    config.upload.secret,
    { expiresIn: '1h' }
  );
  
  return {
    token,
    uploadUrl: `${config.upload.endpoint}/upload`,
    expireAt: new Date(Date.now() + 3600000),
    maxSize: 5 * 1024 * 1024,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  };
}
```

### 5. 文件命名
```typescript
function generateFileKey(userId: bigint, type: string, ext: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 15);
  
  return `${type}/${year}/${month}/${day}/${userId}_${random}.${ext}`;
}
```

### 6. 前端上传
```typescript
async function uploadImage(file: File): Promise<string> {
  // 1. 获取上传凭证
  const { token, uploadUrl } = await getUploadToken('equipment');
  
  // 2. 压缩图片
  const compressed = await compressImage(file);
  
  // 3. 上传
  const formData = new FormData();
  formData.append('token', token);
  formData.append('file', compressed);
  
  const response = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
  });
  
  const { url } = await response.json();
  return url;
}

async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        let width = img.width;
        let height = img.height;
        
        // 限制最大尺寸
        const maxSize = 1920;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => resolve(blob!), 'image/webp', 0.8);
      };
      img.src = e.target!.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

## 存储配置

### MinIO（开发环境）
```typescript
const minioConfig = {
  endPoint: 'localhost',
  port: 9000,
  useSSL: false,
  accessKey: 'minioadmin',
  secretKey: 'minioadmin',
  bucket: 'machinery-images',
};
```

### 阿里云OSS（生产环境）
```typescript
const ossConfig = {
  region: 'oss-cn-hangzhou',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: 'machinery-platform',
};
```

## 安全机制

- 上传凭证有效期1小时
- 文件类型白名单
- 文件大小限制
- 用户上传配额
- 恶意文件检测
