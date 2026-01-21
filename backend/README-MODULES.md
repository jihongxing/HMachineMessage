# 模块实现说明

## 08-分类地区模块

### 已实现功能

#### 分类管理
- ✅ 分类树形结构查询 `GET /api/v1/categories/tree`
- ✅ 分类详情查询 `GET /api/v1/categories/:id`
- ✅ 创建分类 `POST /api/v1/categories`
- ✅ 更新分类 `PUT /api/v1/categories/:id`
- ✅ 删除分类 `DELETE /api/v1/categories/:id`
- ✅ 分类数据缓存（1小时）
- ✅ 初始数据导入脚本

#### 地区管理
- ✅ 省份列表 `GET /api/v1/regions/provinces`
- ✅ 城市列表 `GET /api/v1/regions/cities/:provinceId`
- ✅ 区县列表 `GET /api/v1/regions/counties/:cityId`
- ✅ 按代码查询 `GET /api/v1/regions/code/:code`
- ✅ 导入地区数据 `POST /api/v1/regions/import`
- ✅ 地区数据缓存（1天）
- ✅ 初始数据导入脚本

### 文件结构
```
backend/src/
├── controllers/
│   ├── category.controller.ts
│   └── region.controller.ts
├── services/
│   ├── category.service.ts
│   └── region.service.ts
├── routes/
│   ├── category.routes.ts
│   └── region.routes.ts
└── prisma/seeds/
    ├── categories.json
    ├── regions.json
    ├── seed-categories.ts
    └── seed-regions.ts
```

### 使用方法

#### 1. 导入初始数据
```bash
# 导入分类数据
npm run seed:categories

# 导入地区数据
npm run seed:regions

# 导入所有数据
npm run seed:all
```

#### 2. API调用示例

**获取分类树**
```bash
curl http://localhost:3001/api/v1/categories/tree
```

**获取省份列表**
```bash
curl http://localhost:3001/api/v1/regions/provinces
```

**获取城市列表**
```bash
curl http://localhost:3001/api/v1/regions/cities/1
```

---

## 09-文件上传模块

### 已实现功能

#### 图片上传
- ✅ 获取上传凭证 `GET /api/v1/upload/token`
- ✅ 上传文件 `POST /api/v1/upload`
- ✅ 删除文件 `DELETE /api/v1/upload/:key`
- ✅ 我的图片列表 `GET /api/v1/upload/my-images`

#### 图片处理
- ✅ Sharp图片压缩
- ✅ WebP格式转换
- ✅ 尺寸限制（1920x1080）
- ✅ 质量压缩（80%）

#### 存储方案
- ✅ MinIO存储提供者
- ✅ 存储提供者接口（可扩展OSS/七牛云）
- ✅ 文件命名规则（按日期分目录）
- ✅ 图片URL生成

#### 安全机制
- ✅ JWT上传凭证（1小时有效期）
- ✅ 文件类型白名单
- ✅ 文件大小限制（5MB）
- ✅ 用户权限验证

### 文件结构
```
backend/src/
├── controllers/
│   └── upload.controller.ts
├── services/
│   ├── upload.service.ts
│   └── storage/
│       ├── provider.ts
│       └── minio.ts
└── routes/
    └── upload.routes.ts
```

### 环境配置

#### 1. 启动MinIO服务
```bash
docker-compose up -d minio
```

访问MinIO控制台：http://localhost:9001
- 用户名：minioadmin
- 密码：minioadmin

#### 2. 环境变量配置
```env
# Storage
STORAGE_PROVIDER=minio

# MinIO
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=machinery-images
MINIO_CDN_URL=
```

### 使用方法

#### 1. 获取上传凭证
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/upload/token?type=equipment
```

#### 2. 上传文件
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@image.jpg" \
  http://localhost:3001/api/v1/upload
```

#### 3. 删除文件
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/v1/upload/equipment/2026/01/21/123_abc.webp
```

#### 4. 查看我的图片
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3001/api/v1/upload/my-images?page=1&pageSize=20"
```

### 前端集成示例

```typescript
// 1. 获取上传凭证
const { token, uploadUrl } = await fetch('/api/v1/upload/token?type=equipment', {
  headers: { Authorization: `Bearer ${userToken}` }
}).then(r => r.json());

// 2. 压缩图片（前端）
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

// 3. 上传
const compressed = await compressImage(file);
const formData = new FormData();
formData.append('file', compressed);

const response = await fetch(uploadUrl, {
  method: 'POST',
  headers: { Authorization: `Bearer ${userToken}` },
  body: formData,
});

const { url } = await response.json();
console.log('上传成功:', url);
```

---

## 数据库迁移

### 新增表

#### images表
```sql
CREATE TABLE "images" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" BIGINT NOT NULL,
    "key" VARCHAR(200) NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "mime_type" VARCHAR(50) NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "images_user_id_idx" ON "images"("user_id");
CREATE INDEX "images_key_idx" ON "images"("key");
```

### 运行迁移
```bash
cd backend
npx prisma migrate dev
```

---

## 依赖包

### 新增依赖
```json
{
  "dependencies": {
    "sharp": "^0.33.0",
    "minio": "^7.1.3",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "@types/multer": "^1.4.11",
    "@types/minio": "^7.1.1"
  }
}
```

### 安装
```bash
cd backend
npm install
```

---

## 测试清单

### 分类地区模块
- [ ] 导入分类数据
- [ ] 查询分类树
- [ ] 创建/更新/删除分类
- [ ] 导入地区数据
- [ ] 查询省市县三级数据
- [ ] 缓存功能验证

### 文件上传模块
- [ ] 启动MinIO服务
- [ ] 获取上传凭证
- [ ] 上传图片（JPG/PNG/WebP）
- [ ] 验证图片压缩
- [ ] 验证WebP转换
- [ ] 删除图片
- [ ] 查询我的图片列表
- [ ] 文件大小限制验证
- [ ] 文件类型限制验证

---

## 注意事项

1. **MinIO配置**：生产环境需要配置CDN加速
2. **图片压缩**：前端和后端双重压缩，确保文件大小
3. **缓存策略**：分类1小时，地区1天
4. **权限控制**：上传和删除需要用户认证
5. **存储扩展**：可通过实现StorageProvider接口支持OSS/七牛云


---

## 10-二维码分享模块

### 已实现功能

#### 二维码生成
- ✅ 生成设备二维码 `POST /api/v1/qrcode/equipment/:id`
- ✅ 重新生成二维码 `PUT /api/v1/qrcode/equipment/:id`
- ✅ 批量生成二维码 `POST /api/v1/qrcode/batch`
- ✅ 400x400像素PNG格式
- ✅ 自动上传到MinIO存储

#### 扫码统计
- ✅ 记录扫码 `POST /api/v1/qrcode/scan/:id`
- ✅ 扫码统计 `GET /api/v1/qrcode/stats/:id`
- ✅ 来源分布统计
- ✅ 日期趋势统计
- ✅ IP和UserAgent记录

### 文件结构
```
backend/src/
├── controllers/
│   └── qrcode.controller.ts
├── services/
│   └── qrcode.service.ts
└── routes/
    └── qrcode.routes.ts

frontend/src/
└── components/
    └── QRCodeShare.tsx
```

---

## 11-地图定位模块

### 已实现功能

#### 地理编码
- ✅ 地址转坐标 `POST /api/v1/location/geocode`
- ✅ 坐标转地址 `POST /api/v1/location/reverse-geocode`
- ✅ 更新设备位置 `PUT /api/v1/location/equipment/:id`
- ✅ 批量更新位置 `POST /api/v1/location/batch-update`

#### 附近搜索
- ✅ 附近设备搜索 `GET /api/v1/location/nearby`
- ✅ 距离计算（Haversine公式）
- ✅ 半径筛选（默认50公里）
- ✅ 分类/价格筛选
- ✅ 按距离排序

#### 周边推荐
- ✅ 设备周边 `GET /api/v1/location/surroundings/:id`
- ✅ 相似设备推荐

### 文件结构
```
backend/src/
├── controllers/
│   └── location.controller.ts
├── services/
│   └── location.service.ts
└── routes/
    └── location.routes.ts

frontend/src/
└── components/
    └── MapLocation.tsx
```

---

## 07-SEO优化模块

### 已实现功能

#### 元数据生成
- ✅ 设备页SEO `GET /api/v1/seo/equipment/:id`
- ✅ 分类页SEO `GET /api/v1/seo/category`
- ✅ 地区页SEO `GET /api/v1/seo/region`
- ✅ 动态Title/Description
- ✅ Keywords生成
- ✅ Open Graph标签

#### Sitemap
- ✅ 生成sitemap.xml `GET /api/v1/seo/sitemap.xml`
- ✅ 包含设备/分类/地区页
- ✅ 自动更新时间
- ✅ 优先级配置

#### 结构化数据
- ✅ Schema.org Product `GET /api/v1/seo/structured-data/:id`
- ✅ 价格信息
- ✅ 评分信息
- ✅ 品牌信息

#### 搜索优化
- ✅ 记录搜索关键词 `POST /api/v1/seo/search`
- ✅ 热门搜索 `GET /api/v1/seo/hot-keywords`
- ✅ robots.txt `GET /api/v1/seo/robots.txt`

### 前端优化
- ✅ Next.js SSR/SSG支持
- ✅ 面包屑导航组件
- ✅ 结构化数据注入
- ✅ 图片优化组件
- ✅ sitemap.ts生成
- ✅ robots.ts配置

### 文件结构
```
backend/src/
├── controllers/
│   └── seo.controller.ts
├── services/
│   └── seo.service.ts
└── routes/
    └── seo.routes.ts

frontend/src/
├── lib/
│   └── seo.ts
├── components/
│   ├── Breadcrumb.tsx
│   ├── StructuredData.tsx
│   └── ImageOptimized.tsx
├── app/
│   ├── sitemap.ts
│   ├── robots.ts
│   └── equipment/[id]/page.tsx
└── next.config.js
```

---

## 01-用户认证模块

### 已实现功能

#### 认证功能
- ✅ 发送短信验证码 `POST /api/v1/auth/sms/send`
- ✅ 手机号注册 `POST /api/v1/auth/register`
- ✅ 密码登录 `POST /api/v1/auth/login`
- ✅ 验证码登录 `POST /api/v1/auth/login/sms`
- ✅ 重置密码 `POST /api/v1/auth/password/reset`
- ✅ JWT认证中间件
- ✅ 短信验证码限流（60秒/次，10次/天/手机号，50次/天/IP）

#### 用户信息
- ✅ 获取用户信息 `GET /api/v1/user/profile`
- ✅ 更新用户信息 `PUT /api/v1/user/profile`
- ✅ 修改密码 `PUT /api/v1/user/password`
- ✅ 实名认证 `POST /api/v1/user/verify/realname`
- ✅ 企业认证 `POST /api/v1/user/verify/company`

### 文件结构
```
backend/src/
├── controllers/
│   ├── auth.controller.ts
│   └── user.controller.ts
├── services/
│   ├── auth.service.ts
│   ├── user.service.ts
│   └── sms.service.ts
├── routes/
│   ├── auth.routes.ts
│   └── user.routes.ts
└── middleware/
    └── auth.ts
```

---

## 02-设备管理模块

### 已实现功能

#### 设备管理
- ✅ 发布设备 `POST /api/v1/equipment`
- ✅ 更新设备 `PUT /api/v1/equipment/:id`
- ✅ 删除设备 `DELETE /api/v1/equipment/:id`
- ✅ 上架/下架 `PUT /api/v1/equipment/:id/status`
- ✅ 设备详情 `GET /api/v1/equipment/:id`
- ✅ 设备列表 `GET /api/v1/equipment`
- ✅ 我的设备 `GET /api/v1/equipment/user/my`

#### 搜索功能
- ✅ 分类筛选
- ✅ 地区筛选
- ✅ 关键词搜索
- ✅ 价格区间
- ✅ 档位筛选
- ✅ 多种排序（时间/热度/距离/档位）

#### 联系功能
- ✅ 查看联系方式 `POST /api/v1/equipment/:id/contact`
- ✅ 联系次数限制（50/100/200次/天）
- ✅ 浏览历史记录
- ✅ 浏览量统计

#### 智能审核
- ✅ AI风险评分（0-100）
- ✅ 低风险自动通过（<20分）
- ✅ 敏感词检测
- ✅ 价格异常检测
- ✅ 信息完整度检测

#### 发布限制
- ✅ 新用户：10次/天
- ✅ 普通用户：50次/天
- ✅ 优质/认证用户：不限

### 文件结构
```
backend/src/
├── controllers/
│   └── equipment.controller.ts
├── services/
│   └── equipment.service.ts
├── routes/
│   └── equipment.routes.ts
└── utils/
    └── distance.ts
```

---

## 05-后台管理模块

### 已实现功能

#### 设备审核
- ✅ 审核设备 `PUT /api/v1/admin/equipment/:id/audit`
- ✅ 待审核列表 `GET /api/v1/admin/equipment/pending`
- ✅ 风险评分筛选
- ✅ 审核日志记录
- ✅ 审核通知

#### 用户管理
- ✅ 用户列表 `GET /api/v1/admin/users`
- ✅ 封禁/解封用户 `PUT /api/v1/admin/users/:id/status`
- ✅ 关键词搜索
- ✅ 等级筛选
- ✅ 状态筛选

#### 举报管理
- ✅ 举报列表 `GET /api/v1/admin/reports`
- ✅ 处理举报 `PUT /api/v1/admin/reports/:id/handle`
- ✅ 自动下架违规内容

#### 数据统计
- ✅ 数据统计 `GET /api/v1/admin/stats`
- ✅ 用户统计（总数/新增/活跃）
- ✅ 设备统计（总数/新增/待审核）
- ✅ 订单统计（总数/金额/已支付）
- ✅ 审核统计（总数/自动/人工）

### 文件结构
```
backend/src/
├── controllers/
│   └── admin.controller.ts
├── services/
│   └── admin.service.ts
└── routes/
    └── admin.routes.ts
```

---

## 使用说明

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，配置数据库、Redis等
```

### 3. 数据库迁移
```bash
npm run prisma:migrate
```

### 4. 导入初始数据
```bash
npm run seed:all
```

### 5. 启动服务
```bash
npm run dev
```

---

## API测试示例

### 用户注册
```bash
# 1. 发送验证码
curl -X POST http://localhost:3001/api/v1/auth/sms/send \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","type":"register"}'

# 2. 注册
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456","password":"abc123","nickname":"测试用户"}'
```

### 发布设备
```bash
curl -X POST http://localhost:3001/api/v1/equipment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category1":"农业机械",
    "category2":"收获",
    "model":"久保田688",
    "province":"安徽省",
    "city":"滁州市",
    "county":"来安县",
    "address":"XX镇XX村",
    "price":500,
    "priceUnit":"day",
    "phone":"13800138000",
    "images":["https://example.com/1.jpg"],
    "description":"设备描述"
  }'
```

### 设备列表
```bash
curl "http://localhost:3001/api/v1/equipment?category1=农业机械&city=滁州市&page=1&pageSize=20"
```

---

## 注意事项

1. **认证中间件**：所有需要登录的接口都使用`authenticate`中间件
2. **参数验证**：使用Zod进行参数验证
3. **错误处理**：统一使用自定义错误类和错误处理中间件
4. **BigInt处理**：数据库ID使用BigInt，需要转换为字符串返回
5. **缓存策略**：短信验证码、联系限制等使用Redis缓存
6. **风险评分**：设备发布时自动计算风险评分，低风险自动通过
7. **管理员权限**：后台管理接口需要添加管理员权限检查（TODO）
