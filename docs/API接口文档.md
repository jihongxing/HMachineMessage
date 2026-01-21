# API接口文档 - 重型机械信息中介平台

## 基础信息

**Base URL**: `https://api.example.com/v1`

**认证方式**: Bearer Token (JWT)

**请求头**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**响应格式**:
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

**错误码**:
- 0: 成功
- 400: 请求参数错误
- 401: 未授权
- 403: 无权限
- 404: 资源不存在
- 429: 请求过于频繁
- 500: 服务器错误

---

## 1. 用户认证模块

### 1.1 发送短信验证码

**POST** `/auth/sms/send`

**请求参数**:
```json
{
  "phone": "13800138000",
  "type": "register" // register/login/reset
}
```

**响应**:
```json
{
  "code": 0,
  "message": "验证码已发送",
  "data": {
    "expireAt": "2024-01-01T12:05:00Z"
  }
}
```

**限流规则**:
- 同一手机号：60秒/次，10次/天
- 同一IP：50次/天

---

### 1.2 手机号注册

**POST** `/auth/register`

**请求参数**:
```json
{
  "phone": "13800138000",
  "code": "123456",
  "password": "abc123456",
  "nickname": "用户昵称"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "用户昵称",
      "avatar": null,
      "userLevel": 0
    }
  }
}
```

---

### 1.3 密码登录

**POST** `/auth/login`

**请求参数**:
```json
{
  "phone": "13800138000",
  "password": "abc123456",
  "captcha": "abcd" // 失败3次后需要
}
```

**响应**: 同注册接口

---

### 1.4 验证码登录

**POST** `/auth/login/sms`

**请求参数**:
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应**: 同注册接口

---

### 1.5 找回密码

**POST** `/auth/password/reset`

**请求参数**:
```json
{
  "phone": "13800138000",
  "code": "123456",
  "newPassword": "newpass123"
}
```

---

### 1.6 微信登录

**POST** `/auth/wechat/login`

**请求参数**:
```json
{
  "code": "wechat_auth_code"
}
```

**响应**: 
- 已绑定手机号：返回token和用户信息
- 未绑定：返回临时token，需调用绑定接口

---

## 2. 用户信息模块

### 2.1 获取当前用户信息

**GET** `/user/profile`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "phone": "138****8000",
    "nickname": "用户昵称",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "userLevel": 1,
    "realName": "张三",
    "companyName": null,
    "balance": 100.00,
    "publishCount": 5,
    "passCount": 5,
    "violationCount": 0,
    "status": 0
  }
}
```

---

### 2.2 更新用户信息

**PUT** `/user/profile`

**请求参数**:
```json
{
  "nickname": "新昵称",
  "avatar": "https://cdn.example.com/new-avatar.jpg"
}
```

---

### 2.3 修改密码

**PUT** `/user/password`

**请求参数**:
```json
{
  "oldPassword": "oldpass123",
  "newPassword": "newpass123"
}
```

---

### 2.4 实名认证

**POST** `/user/verify/realname`

**请求参数**:
```json
{
  "realName": "张三",
  "idCard": "110101199001011234"
}
```

---

### 2.5 企业认证

**POST** `/user/verify/company`

**请求参数**:
```json
{
  "companyName": "XX农机合作社",
  "businessLicense": "91110000XXXXXXXXXX",
  "legalPerson": "张三",
  "licenseImage": "https://cdn.example.com/license.jpg"
}
```

---

## 3. 设备管理模块

### 3.1 发布设备

**POST** `/equipment`

**请求参数**:
```json
{
  "category1": "农业机械",
  "category2": "收获",
  "model": "久保田688",
  "province": "安徽省",
  "city": "滁州市",
  "county": "来安县",
  "address": "XX镇XX村",
  "latitude": 32.123456,
  "longitude": 118.123456,
  "price": 500.00,
  "priceUnit": "day",
  "phone": "13800138000",
  "wechat": "wx123456",
  "images": [
    "https://cdn.example.com/img1.jpg",
    "https://cdn.example.com/img2.jpg"
  ],
  "description": "设备描述信息...",
  "capacity": "50亩/天",
  "availableStart": "2024-05-01",
  "availableEnd": "2024-10-31"
}
```

**响应**:
```json
{
  "code": 0,
  "message": "发布成功，等待审核",
  "data": {
    "id": 1001,
    "status": 0
  }
}
```

---

### 3.2 编辑设备

**PUT** `/equipment/:id`

**请求参数**: 同发布设备

---

### 3.3 删除设备

**DELETE** `/equipment/:id`

---

### 3.4 上架/下架设备

**PUT** `/equipment/:id/status`

**请求参数**:
```json
{
  "action": "online" // online/offline
}
```

---

### 3.5 获取设备详情

**GET** `/equipment/:id`

**响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1001,
    "userId": 1,
    "category1": "农业机械",
    "category2": "收获",
    "model": "久保田688",
    "province": "安徽省",
    "city": "滁州市",
    "county": "来安县",
    "address": "XX镇XX村",
    "price": 500.00,
    "priceUnit": "day",
    "phone": "138****8000",
    "wechat": null,
    "images": ["..."],
    "description": "...",
    "capacity": "50亩/天",
    "availableStart": "2024-05-01",
    "availableEnd": "2024-10-31",
    "status": 1,
    "rankLevel": 0,
    "viewCount": 100,
    "contactCount": 10,
    "favoriteCount": 5,
    "rating": 4.8,
    "ratingCount": 12,
    "distance": 15.5,
    "qrcodeUrl": "https://cdn.example.com/qrcode.png",
    "user": {
      "id": 1,
      "nickname": "用户昵称",
      "avatar": "...",
      "userLevel": 2
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

---

### 3.6 设备列表（搜索）

**GET** `/equipment`

**查询参数**:
```
category1=农业机械
category2=收获
province=安徽省
city=滁州市
county=来安县
keyword=久保田
priceMin=0
priceMax=1000
rankLevel=0,1,2
sort=distance // distance/time/hot/rank
page=1
pageSize=20
latitude=32.123456
longitude=118.123456
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": 1001,
        "model": "久保田688",
        "images": ["..."],
        "price": 500.00,
        "priceUnit": "day",
        "county": "来安县",
        "city": "滁州市",
        "rankLevel": 2,
        "rating": 4.8,
        "ratingCount": 12,
        "distance": 15.5,
        "viewCount": 100
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 3.7 我的设备列表

**GET** `/user/equipment`

**查询参数**:
```
status=1 // 0待审核/1已发布/2已拒绝/3已下架
page=1
pageSize=20
```

---

### 3.8 查看联系方式

**POST** `/equipment/:id/contact`

**请求参数**:
```json
{
  "type": "phone" // phone/wechat
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "phone": "13800138000",
    "wechat": "wx123456"
  }
}
```

**限流规则**:
- 同一用户查看同一设备：不限次数（已查看过直接返回）
- 同一用户每日查看不同设备：50次（普通用户）
- 同一IP每日：200次

---

## 4. 收藏模块

### 4.1 收藏设备

**POST** `/favorites`

**请求参数**:
```json
{
  "equipmentId": 1001
}
```

---

### 4.2 取消收藏

**DELETE** `/favorites/:equipmentId`

---

### 4.3 我的收藏列表

**GET** `/favorites`

**查询参数**:
```
page=1
pageSize=20
```

---

## 5. 评价模块

### 5.1 发布评价

**POST** `/reviews`

**请求参数**:
```json
{
  "equipmentId": 1001,
  "rating": 5,
  "content": "设备很好，服务态度也不错",
  "images": ["https://cdn.example.com/review1.jpg"],
  "tags": ["服务好", "价格合理", "设备新"]
}
```

---

### 5.2 修改评价

**PUT** `/reviews/:id`

**请求参数**: 同发布评价

**限制**: 仅7天内可修改

---

### 5.3 设备评价列表

**GET** `/equipment/:id/reviews`

**查询参数**:
```
page=1
pageSize=20
sort=time // time/rating
```

---

### 5.4 举报评价

**POST** `/reviews/:id/report`

**请求参数**:
```json
{
  "reason": "恶意差评",
  "images": ["证据图片"]
}
```

---

## 6. 订单支付模块

### 6.1 创建订单

**POST** `/orders`

**请求参数**:
```json
{
  "equipmentId": 1001,
  "rankLevel": 2,
  "rankRegion": "city",
  "duration": 1
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "orderId": 10001,
    "orderNo": "ORD20240101120000001",
    "amount": 200.00,
    "payAmount": 200.00
  }
}
```

---

### 6.2 支付订单

**POST** `/orders/:id/pay`

**请求参数**:
```json
{
  "payMethod": "wechat" // wechat/alipay/balance
}
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "payUrl": "weixin://wxpay/...",
    "qrcode": "https://cdn.example.com/pay-qrcode.png"
  }
}
```

---

### 6.3 订单列表

**GET** `/orders`

**查询参数**:
```
status=1 // 0待支付/1已支付/2已退款/3已取消
page=1
pageSize=20
```

---

### 6.4 订单详情

**GET** `/orders/:id`

---

### 6.5 申请退款

**POST** `/orders/:id/refund`

**请求参数**:
```json
{
  "reason": "退款原因"
}
```

---

## 7. 充值模块

### 7.1 创建充值订单

**POST** `/recharge`

**请求参数**:
```json
{
  "amount": 500.00,
  "payMethod": "wechat"
}
```

---

### 7.2 充值记录

**GET** `/recharge/history`

**查询参数**:
```
page=1
pageSize=20
```

---

## 8. 通知模块

### 8.1 通知列表

**GET** `/notifications`

**查询参数**:
```
type=audit // audit/payment/interaction/system
isRead=false
page=1
pageSize=20
```

---

### 8.2 标记已读

**PUT** `/notifications/:id/read`

---

### 8.3 全部标记已读

**PUT** `/notifications/read-all`

---

### 8.4 未读数量

**GET** `/notifications/unread-count`

**响应**:
```json
{
  "code": 0,
  "data": {
    "total": 5,
    "audit": 2,
    "payment": 1,
    "interaction": 2,
    "system": 0
  }
}
```

---

## 9. 浏览历史模块

### 9.1 浏览历史列表

**GET** `/history`

**查询参数**:
```
page=1
pageSize=30
```

---

### 9.2 清空浏览历史

**DELETE** `/history`

---

## 10. 数据统计模块

### 10.1 设备数据统计

**GET** `/equipment/:id/stats`

**查询参数**:
```
period=7d // 1d/7d/30d/all
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "viewCount": {
      "total": 1000,
      "today": 50,
      "yesterday": 45,
      "trend": [10, 15, 20, 25, 30, 35, 40]
    },
    "contactCount": {
      "total": 100,
      "today": 5,
      "yesterday": 4,
      "trend": [1, 2, 3, 4, 5, 6, 7]
    },
    "scanCount": {
      "total": 50,
      "today": 2,
      "yesterday": 3,
      "trend": [1, 1, 2, 2, 3, 3, 2]
    },
    "favoriteCount": 20,
    "rating": 4.8,
    "ratingCount": 15,
    "avgData": {
      "category": {
        "viewCount": 500,
        "contactCount": 50
      },
      "region": {
        "viewCount": 600,
        "contactCount": 60
      }
    }
  }
}
```

---

## 11. 分类地区模块

### 11.1 分类列表

**GET** `/categories`

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "农业机械",
      "slug": "agricultural",
      "icon": "...",
      "children": [
        {
          "id": 11,
          "name": "收获",
          "slug": "harvester"
        }
      ]
    }
  ]
}
```

---

### 11.2 地区列表

**GET** `/regions`

**查询参数**:
```
parentId=0 // 0获取省级，传省ID获取市级，传市ID获取县级
```

**响应**:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "name": "安徽省",
      "code": "340000",
      "level": 1
    }
  ]
}
```

---

## 12. 文件上传模块

### 12.1 获取上传凭证

**GET** `/upload/token`

**查询参数**:
```
type=equipment // equipment/avatar/review/report
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "token": "upload_token_xxx",
    "uploadUrl": "https://upload.example.com",
    "expireAt": "2024-01-01T13:00:00Z"
  }
}
```

---

### 12.2 上传文件

**POST** `https://upload.example.com`

**请求参数** (multipart/form-data):
```
token: upload_token_xxx
file: [binary]
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "url": "https://cdn.example.com/xxx.jpg",
    "size": 102400,
    "width": 1920,
    "height": 1080
  }
}
```

---

## 13. 系统配置模块

### 13.1 获取系统配置

**GET** `/config`

**响应**:
```json
{
  "code": 0,
  "data": {
    "rankPrices": {
      "recommend": 100,
      "top": 200
    },
    "rechargeBonusRules": [
      {"amount": 500, "bonus": 50},
      {"amount": 1000, "bonus": 150}
    ],
    "contactLimits": {
      "normal": 50,
      "premium": 100,
      "verified": 200
    },
    "platformName": "重机通",
    "customerService": {
      "phone": "400-xxx-xxxx",
      "wechat": "xxx",
      "workTime": "9:00-18:00"
    }
  }
}
```

---

## 14. 后台管理模块

### 14.1 审核设备

**PUT** `/admin/equipment/:id/audit`

**请求参数**:
```json
{
  "action": "approve", // approve/reject
  "reason": "拒绝原因"
}
```

---

### 14.2 待审核列表

**GET** `/admin/equipment/pending`

**查询参数**:
```
riskScore=60-100 // 风险评分范围
page=1
pageSize=20
```

---

### 14.3 用户管理

**GET** `/admin/users`

**查询参数**:
```
keyword=手机号/昵称
userLevel=0,1,2,3
status=0,1
page=1
pageSize=20
```

---

### 14.4 封禁/解封用户

**PUT** `/admin/users/:id/status`

**请求参数**:
```json
{
  "action": "ban", // ban/unban
  "reason": "封禁原因",
  "duration": 7 // 天数，0表示永久
}
```

---

### 14.5 数据统计

**GET** `/admin/stats`

**查询参数**:
```
startDate=2024-01-01
endDate=2024-01-31
```

**响应**:
```json
{
  "code": 0,
  "data": {
    "users": {
      "total": 10000,
      "new": 500,
      "active": 3000
    },
    "equipment": {
      "total": 50000,
      "new": 1000,
      "pending": 50
    },
    "orders": {
      "total": 5000,
      "amount": 500000.00,
      "paid": 4500
    },
    "audit": {
      "total": 1000,
      "auto": 900,
      "manual": 100,
      "avgTime": 300
    }
  }
}
```

---

## 15. 举报模块

### 15.1 举报设备

**POST** `/reports`

**请求参数**:
```json
{
  "targetType": "equipment",
  "targetId": 1001,
  "reason": "虚假信息",
  "images": ["证据图片"]
}
```

---

### 15.2 举报列表（管理员）

**GET** `/admin/reports`

**查询参数**:
```
status=0 // 0待处理/1已处理/2已驳回
page=1
pageSize=20
```

---

### 15.3 处理举报

**PUT** `/admin/reports/:id/handle`

**请求参数**:
```json
{
  "action": "approve", // approve/reject
  "result": "处理结果说明"
}
```

---

## 附录

### A. 排序规则

**设备列表排序算法**:
```
排序分数 = 档位权重 + 时间戳权重

档位权重:
- 置顶位: 1000000000000
- 推荐位: 500000000000
- 基础展示: 0

时间戳权重:
- Unix时间戳（秒）

最终排序: ORDER BY 排序分数 DESC
```

### B. 距离计算

使用Haversine公式计算两点间距离：
```
a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
d = R × c

R = 6371 (地球半径，单位：公里)
```

### C. 风险评分规则

AI审核风险评分（0-100）：
- 0-20: 低风险，自动通过
- 20-60: 中风险，人工快速确认
- 60-100: 高风险，人工详细审核

评分因素：
- 敏感词检测: +20
- 图片质量差: +10
- 信息不完整: +15
- 价格异常: +20
- 重复内容: +25
- 用户信用低: +10

### D. 用户等级升级规则

- 新用户(0): 注册即获得
- 普通用户(1): 5条设备通过审核
- 优质用户(2): 20条设备通过 + 0违规
- 认证用户(3): 实名/企业认证通过

### E. 限流规则汇总

| 接口 | 限制 |
|------|------|
| 发送验证码 | 60秒/次，10次/天/手机号，50次/天/IP |
| 查看联系方式 | 50次/天（普通），100次/天（优质），200次/天（认证） |
| 发布设备 | 10次/天（新用户），50次/天（普通用户），不限（优质/认证） |
| 发布评价 | 20次/天 |
| 举报 | 10次/天 |
