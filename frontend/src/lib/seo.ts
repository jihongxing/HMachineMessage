import { Metadata } from 'next';

interface SeoConfig {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  canonical?: string;
}

export function generateMetadata(config: SeoConfig): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  
  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords?.join(', '),
    openGraph: {
      title: config.title,
      description: config.description,
      url: config.canonical || baseUrl,
      siteName: '重型机械信息中介平台',
      images: config.ogImage ? [{ url: config.ogImage }] : [],
      locale: 'zh_CN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: config.ogImage ? [config.ogImage] : [],
    },
    alternates: {
      canonical: config.canonical,
    },
  };
}

export function generateEquipmentMetadata(equipment: {
  id: string;
  model: string;
  category1: string;
  category2: string;
  city: string;
  county: string;
  description?: string;
  images?: string[];
  price: number;
  priceUnit: string;
}): Metadata {
  const title = `${equipment.model} - ${equipment.category1}${equipment.category2} - ${equipment.city}${equipment.county}`;
  const description = equipment.description?.substring(0, 150) || 
    `${equipment.model}，位于${equipment.city}${equipment.county}，${equipment.priceUnit === 'day' ? '日' : '时'}租金${equipment.price}元`;
  
  return generateMetadata({
    title,
    description,
    keywords: [
      equipment.category1,
      equipment.category2,
      equipment.model,
      equipment.city,
      '机械租赁',
      '设备出租',
    ],
    ogImage: equipment.images?.[0],
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/equipment/${equipment.id}`,
  });
}

export function generateCategoryMetadata(category1: string, category2?: string): Metadata {
  const title = category2
    ? `${category1} - ${category2} - 机械设备租赁`
    : `${category1} - 机械设备租赁`;
  
  const description = category2
    ? `查找${category1}${category2}设备租赁信息，提供全国各地优质机械设备出租服务`
    : `查找${category1}设备租赁信息，涵盖多种机械设备类型，全国范围服务`;

  return generateMetadata({
    title,
    description,
    keywords: [category1, category2, '机械租赁', '设备出租'].filter(Boolean) as string[],
  });
}

export function generateRegionMetadata(province: string, city?: string, county?: string): Metadata {
  let location = province;
  if (city) location += city;
  if (county) location += county;

  const title = `${location}机械设备租赁 - 本地优质设备出租`;
  const description = `${location}地区机械设备租赁平台，提供各类工程机械、农业机械等设备出租服务，价格透明，服务可靠`;

  return generateMetadata({
    title,
    description,
    keywords: [location, '机械租赁', '设备出租', province, city, county].filter(Boolean) as string[],
  });
}

export function generateStructuredData(equipment: {
  id: string;
  model: string;
  category1: string;
  category2: string;
  description?: string;
  images?: string[];
  price: number;
  rating?: number;
  ratingCount?: number;
  availableEnd?: string;
  user: { nickname: string };
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: equipment.model,
    description: equipment.description || `${equipment.model} - ${equipment.category1}${equipment.category2}`,
    image: equipment.images,
    offers: {
      '@type': 'Offer',
      price: equipment.price.toString(),
      priceCurrency: 'CNY',
      availability: 'https://schema.org/InStock',
      priceValidUntil: equipment.availableEnd,
    },
    aggregateRating: equipment.ratingCount && equipment.ratingCount > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: equipment.rating?.toString(),
      reviewCount: equipment.ratingCount,
    } : undefined,
    brand: {
      '@type': 'Brand',
      name: equipment.user.nickname,
    },
    category: `${equipment.category1} > ${equipment.category2}`,
  };
}
