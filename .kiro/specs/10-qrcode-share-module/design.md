# 二维码分享模块 - 设计文档

## 技术方案

### 1. 二维码服务
```typescript
import QRCode from 'qrcode';

class QRCodeService {
  async generate(equipmentId: bigint): Promise<string> {
    const url = `${config.baseUrl}/share/${equipmentId}`;
    
    // 生成二维码Buffer
    const qrBuffer = await QRCode.toBuffer(url, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'M',
    });
    
    // 上传到对象存储
    const key = `qrcode/${equipmentId}.png`;
    const qrUrl = await storageProvider.upload(qrBuffer, key);
    
    // 更新设备记录
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { qrcodeUrl: qrUrl },
    });
    
    return qrUrl;
  }
  
  async getOrGenerate(equipmentId: bigint): Promise<string> {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      select: { qrcodeUrl: true },
    });
    
    if (equipment?.qrcodeUrl) {
      return equipment.qrcodeUrl;
    }
    
    return this.generate(equipmentId);
  }
}
```

### 2. 扫码统计
```typescript
class ScanService {
  async record(equipmentId: bigint, req: Request): Promise<void> {
    const userAgent = req.headers['user-agent'] || '';
    const source = this.detectSource(userAgent);
    
    await prisma.scanLog.create({
      data: {
        equipmentId,
        source,
        ipAddress: req.ip,
        userAgent,
      },
    });
    
    // 异步更新扫码计数
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { scanCount: { increment: 1 } },
    });
  }
  
  private detectSource(userAgent: string): string {
    if (userAgent.includes('MicroMessenger')) return 'wechat';
    if (userAgent.includes('Mobile')) return 'mobile';
    return 'browser';
  }
  
  async getStats(equipmentId: bigint, period: string): Promise<ScanStats> {
    const startDate = this.getStartDate(period);
    
    const [total, bySource, trend] = await Promise.all([
      // 总扫码数
      prisma.scanLog.count({
        where: { equipmentId, createdAt: { gte: startDate } },
      }),
      
      // 按来源统计
      prisma.scanLog.groupBy({
        by: ['source'],
        where: { equipmentId, createdAt: { gte: startDate } },
        _count: true,
      }),
      
      // 趋势数据
      this.getTrend(equipmentId, startDate),
    ]);
    
    return { total, bySource, trend };
  }
}
```

### 3. 分享页面
```typescript
// app/share/[id]/page.tsx
export default async function SharePage({ params }: { params: { id: string } }) {
  const equipment = await prisma.equipment.findUnique({
    where: { id: BigInt(params.id) },
    include: { user: true },
  });
  
  if (!equipment || equipment.status !== 1) {
    notFound();
  }
  
  return (
    <div className="share-page">
      <Image src={equipment.images[0]} alt={equipment.model} />
      <h1>{equipment.model}</h1>
      <p>{equipment.category1} / {equipment.category2}</p>
      <p>{equipment.province} {equipment.city} {equipment.county}</p>
      <p className="price">¥{equipment.price}/{equipment.priceUnit === 'day' ? '天' : '小时'}</p>
      
      <ContactButton equipmentId={equipment.id} />
      
      <Link href="/equipment">查看更多设备</Link>
      <Link href="/equipment/create">我也要发布</Link>
    </div>
  );
}

// 元数据
export async function generateMetadata({ params }): Promise<Metadata> {
  const equipment = await getEquipment(params.id);
  
  return {
    title: `${equipment.model} - ${equipment.city}${equipment.county}`,
    description: `${equipment.description?.substring(0, 100)}`,
    openGraph: {
      images: [equipment.images[0]],
    },
  };
}
```

### 4. 海报生成
```typescript
import { createCanvas, loadImage } from 'canvas';

class PosterService {
  async generate(equipmentId: bigint): Promise<Buffer> {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });
    
    const canvas = createCanvas(750, 1334);
    const ctx = canvas.getContext('2d');
    
    // 背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 750, 1334);
    
    // 设备图片
    const image = await loadImage(equipment.images[0]);
    ctx.drawImage(image, 0, 0, 750, 750);
    
    // 设备信息
    ctx.fillStyle = '#333333';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText(equipment.model, 40, 850);
    
    ctx.font = '36px sans-serif';
    ctx.fillText(`${equipment.city} ${equipment.county}`, 40, 920);
    
    ctx.fillStyle = '#ff6600';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(`¥${equipment.price}/天`, 40, 1000);
    
    // 二维码
    const qrcode = await loadImage(equipment.qrcodeUrl!);
    ctx.drawImage(qrcode, 475, 900, 240, 240);
    
    // 提示文字
    ctx.fillStyle = '#666666';
    ctx.font = '24px sans-serif';
    ctx.fillText('扫码查看详情', 500, 1180);
    
    // Logo
    const logo = await loadImage('public/logo.png');
    ctx.drawImage(logo, 40, 1200, 120, 40);
    
    return canvas.toBuffer('image/png');
  }
}
```

## 性能优化

- 二维码生成异步处理
- 分享页面SSR
- 扫码统计异步记录
- 海报生成缓存
