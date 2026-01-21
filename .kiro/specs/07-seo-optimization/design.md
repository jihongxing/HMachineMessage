# SEO优化模块 - 设计文档

## 技术方案

### 1. Next.js SSR/SSG
```typescript
// 设备详情页 - SSG
export async function generateStaticParams() {
  const equipment = await prisma.equipment.findMany({
    where: { status: 1 },
    select: { id: true },
  });
  
  return equipment.map(e => ({ id: e.id.toString() }));
}

// 设备列表页 - SSR
export async function getServerSideProps(context) {
  const { category, region } = context.params;
  const data = await fetchEquipmentList({ category, region });
  
  return { props: { data } };
}
```

### 2. 元数据生成
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const equipment = await getEquipment(params.id);
  
  return {
    title: `${equipment.model} ${equipment.category2} - ${equipment.county}${equipment.city} - ${equipment.price}元/天 - 重机通`,
    description: `${equipment.city}${equipment.county}${equipment.model}，${equipment.capacity}，${equipment.availableStart}-${equipment.availableEnd}可租，联系${maskPhone(equipment.phone)}，${equipment.rating}星好评`,
    openGraph: {
      images: [equipment.images[0]],
    },
  };
}
```

### 3. 结构化数据
```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: equipment.model,
  image: equipment.images,
  description: equipment.description,
  offers: {
    '@type': 'Offer',
    price: equipment.price,
    priceCurrency: 'CNY',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: equipment.rating,
    reviewCount: equipment.ratingCount,
  },
};
```

### 4. Sitemap生成
```typescript
// app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const equipment = await prisma.equipment.findMany({
    where: { status: 1 },
    select: { id: true, updatedAt: true },
  });
  
  return equipment.map(e => ({
    url: `https://example.com/equipment/${e.id}`,
    lastModified: e.updatedAt,
    changeFrequency: 'daily',
    priority: 0.8,
  }));
}
```

### 5. Robots.txt
```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/equipment/', '/category/', '/region/'],
        disallow: ['/api/', '/admin/', '/user/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

## 性能优化

### 1. 图片优化
```typescript
import Image from 'next/image';

<Image
  src={equipment.images[0]}
  alt={`${equipment.county}${equipment.model}实拍图1`}
  width={800}
  height={600}
  loading="lazy"
  placeholder="blur"
/>
```

### 2. 代码分割
```typescript
const ReviewList = dynamic(() => import('@/components/ReviewList'), {
  loading: () => <Skeleton />,
  ssr: false,
});
```

### 3. 缓存策略
```typescript
// 静态资源缓存
export const revalidate = 3600; // 1小时

// API路由缓存
export async function GET(request: Request) {
  const data = await fetchData();
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
```

## 监控指标

- LCP（最大内容绘制）< 2.5秒
- FID（首次输入延迟）< 100ms
- CLS（累积布局偏移）< 0.1
- 首屏加载时间 < 2秒
