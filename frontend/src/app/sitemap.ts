import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/seo/sitemap.xml`);
    
    if (!response.ok) {
      return getDefaultSitemap(baseUrl);
    }

    const text = await response.text();
    const urls = parseSitemapXml(text);
    
    return urls;
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
  ];
}

function parseSitemapXml(xml: string): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];
  const urlMatches = xml.matchAll(/<url>(.*?)<\/url>/gs);

  for (const match of urlMatches) {
    const urlBlock = match[1];
    const loc = urlBlock.match(/<loc>(.*?)<\/loc>/)?.[1];
    const lastmod = urlBlock.match(/<lastmod>(.*?)<\/lastmod>/)?.[1];
    const changefreq = urlBlock.match(/<changefreq>(.*?)<\/changefreq>/)?.[1];
    const priority = urlBlock.match(/<priority>(.*?)<\/priority>/)?.[1];

    if (loc) {
      urls.push({
        url: loc,
        lastModified: lastmod ? new Date(lastmod) : new Date(),
        changeFrequency: changefreq as any,
        priority: priority ? parseFloat(priority) : 0.5,
      });
    }
  }

  return urls;
}
