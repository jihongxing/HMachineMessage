import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  try {
    // 从后端获取动态sitemap数据
    const response = await fetch(`${apiUrl}/seo/sitemap-data`, {
      next: { revalidate: 3600 } // 1小时缓存
    });
    
    if (!response.ok) {
      console.error('Failed to fetch sitemap data:', response.status);
      return getDefaultSitemap(baseUrl);
    }

    const data = await response.json();
    
    if (data.code !== 0 || !data.data) {
      return getDefaultSitemap(baseUrl);
    }

    return data.data.map((item: any) => ({
      url: item.url,
      lastModified: new Date(item.lastmod),
      changeFrequency: item.changefreq as any,
      priority: item.priority,
    }));
  } catch (error) {
    console.error('Failed to fetch sitemap:', error);
    return getDefaultSitemap(baseUrl);
  }
}

function getDefaultSitemap(baseUrl: string): MetadataRoute.Sitemap {
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/equipment`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];
}
