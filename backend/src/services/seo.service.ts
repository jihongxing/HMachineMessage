import { prisma } from './prisma';
import { logger } from '../utils/logger';

interface SeoMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export class SeoService {
  /**
   * 生成设备SEO元数据
   */
  async generateEquipmentSeo(equipmentId: bigint): Promise<SeoMetadata> {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        user: {
          select: { nickname: true },
        },
        province: { select: { name: true } },
        city: { select: { name: true } },
        county: { select: { name: true } },
      },
    });

    if (!equipment) {
      throw new Error('设备不存在');
    }

    const title = `${equipment.model} - ${equipment.category1}${equipment.category2} - ${equipment.city?.name || ''}${equipment.county?.name || ''}`;
    const description = equipment.description
      ? equipment.description.substring(0, 150)
      : `${equipment.model}，位于${equipment.province?.name || ''}${equipment.city?.name || ''}${equipment.county?.name || ''}，${equipment.priceUnit === 'day' ? '日' : '时'}租金${equipment.price}元`;
    
    const keywords = [
      equipment.category1,
      equipment.category2,
      equipment.model,
      equipment.city?.name || '',
      equipment.county?.name || '',
      '机械租赁',
      '设备出租',
    ];

    const images = equipment.images as string[];
    const ogImage = images && images.length > 0 ? images[0] : undefined;

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
      ogImage,
      canonical: `${process.env.FRONTEND_URL}/equipment/${equipmentId}`,
    };
  }

  /**
   * 生成分类页SEO元数据
   */
  generateCategorySeo(category1: string, category2?: string): SeoMetadata {
    const title = category2
      ? `${category1} - ${category2} - 机械设备租赁`
      : `${category1} - 机械设备租赁`;
    
    const description = category2
      ? `查找${category1}${category2}设备租赁信息，提供全国各地优质机械设备出租服务`
      : `查找${category1}设备租赁信息，涵盖多种机械设备类型，全国范围服务`;

    const keywords = [category1];
    if (category2) keywords.push(category2);
    keywords.push('机械租赁', '设备出租', '工程机械');

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
    };
  }

  /**
   * 生成地区页SEO元数据
   */
  generateRegionSeo(province: string, city?: string, county?: string): SeoMetadata {
    let location = province;
    if (city) location += city;
    if (county) location += county;

    const title = `${location}机械设备租赁 - 本地优质设备出租`;
    const description = `${location}地区机械设备租赁平台，提供各类工程机械、农业机械等设备出租服务，价格透明，服务可靠`;
    
    const keywords = [location, '机械租赁', '设备出租'];
    if (province) keywords.push(province);
    if (city) keywords.push(city);
    if (county) keywords.push(county);

    return {
      title,
      description,
      keywords,
      ogTitle: title,
      ogDescription: description,
    };
  }

  /**
   * 生成站点地图数据
   */
  async generateSitemap(): Promise<Array<{
    url: string;
    lastmod: string;
    changefreq: string;
    priority: number;
  }>> {
    const baseUrl = process.env.FRONTEND_URL || 'https://example.com';
    const urls: Array<{
      url: string;
      lastmod: string;
      changefreq: string;
      priority: number;
    }> = [];

    // 首页
    urls.push({
      url: baseUrl,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
    });

    // 设备列表
    const equipments = await prisma.equipment.findMany({
      where: { status: 1 },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      take: 10000,
    });

    for (const equipment of equipments) {
      urls.push({
        url: `${baseUrl}/equipment/${equipment.id}`,
        lastmod: equipment.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.8,
      });
    }

    // 分类页
    const categories = await prisma.category.findMany({
      where: { isActive: true },
    });

    for (const category of categories) {
      urls.push({
        url: `${baseUrl}/category/${category.slug}`,
        lastmod: category.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });
    }

    // 地区页
    const regions = await prisma.region.findMany({
      where: { level: { in: [1, 2] } },
      take: 500,
    });

    for (const region of regions) {
      urls.push({
        url: `${baseUrl}/region/${region.code}`,
        lastmod: region.updatedAt.toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      });
    }

    return urls;
  }

  /**
   * 生成robots.txt
   */
  generateRobotsTxt(): string {
    const baseUrl = process.env.FRONTEND_URL || 'https://example.com';
    
    return `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /profile/
Disallow: /orders/

Sitemap: ${baseUrl}/sitemap.xml`;
  }

  /**
   * 生成结构化数据
   */
  async generateStructuredData(equipmentId: bigint): Promise<object> {
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
      include: {
        user: {
          select: { nickname: true },
        },
      },
    });

    if (!equipment) {
      throw new Error('设备不存在');
    }

    const images = equipment.images as string[];

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: equipment.model,
      description: equipment.description || `${equipment.model} - ${equipment.category1}${equipment.category2}`,
      image: images && images.length > 0 ? images : undefined,
      offers: {
        '@type': 'Offer',
        price: equipment.price.toString(),
        priceCurrency: 'CNY',
        availability: 'https://schema.org/InStock',
        priceValidUntil: equipment.availableEnd?.toISOString(),
      },
      aggregateRating: equipment.ratingCount > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: equipment.rating.toString(),
        reviewCount: equipment.ratingCount,
      } : undefined,
      brand: {
        '@type': 'Brand',
        name: equipment.user.nickname,
      },
      category: `${equipment.category1} > ${equipment.category2}`,
    };
  }

  /**
   * 记录搜索关键词
   */
  async recordSearchKeyword(keyword: string, userId?: bigint): Promise<void> {
    try {
      logger.info(`Search keyword: ${keyword}, userId: ${userId}`);
    } catch (error) {
      logger.error('Failed to record search keyword:', error);
    }
  }

  /**
   * 获取热门搜索关键词
   */
  async getHotKeywords(limit: number = 10): Promise<string[]> {
    return [
      '挖掘机',
      '装载机',
      '推土机',
      '收割机',
      '拖拉机',
      '吊车',
      '叉车',
      '压路机',
    ].slice(0, limit);
  }
}

export const seoService = new SeoService();
