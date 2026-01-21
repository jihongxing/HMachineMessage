import { Request, Response } from 'express';
import { seoService } from '../services/seo.service';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/response';

export class SeoController {
  /**
   * 获取设备SEO元数据
   */
  getEquipmentSeo = asyncHandler(async (req: Request, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const metadata = await seoService.generateEquipmentSeo(equipmentId);
    ApiResponse.success(res, metadata);
  });

  /**
   * 获取分类SEO元数据
   */
  getCategorySeo = asyncHandler(async (req: Request, res: Response) => {
    const { category1, category2 } = req.query;
    const metadata = seoService.generateCategorySeo(
      category1 as string,
      category2 as string | undefined
    );
    ApiResponse.success(res, metadata);
  });

  /**
   * 获取地区SEO元数据
   */
  getRegionSeo = asyncHandler(async (req: Request, res: Response) => {
    const { province, city, county } = req.query;
    const metadata = seoService.generateRegionSeo(
      province as string,
      city as string | undefined,
      county as string | undefined
    );
    ApiResponse.success(res, metadata);
  });

  /**
   * 生成sitemap.xml
   */
  generateSitemap = asyncHandler(async (req: Request, res: Response) => {
    const urls = await seoService.generateSitemap();
    
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (const url of urls) {
      xml += '  <url>\n';
      xml += `    <loc>${url.url}</loc>\n`;
      xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += '  </url>\n';
    }
    
    xml += '</urlset>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });

  /**
   * 生成robots.txt
   */
  generateRobotsTxt = asyncHandler(async (req: Request, res: Response) => {
    const content = seoService.generateRobotsTxt();
    res.header('Content-Type', 'text/plain');
    res.send(content);
  });

  /**
   * 获取结构化数据
   */
  getStructuredData = asyncHandler(async (req: Request, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const data = await seoService.generateStructuredData(equipmentId);
    ApiResponse.success(res, data);
  });

  /**
   * 记录搜索关键词
   */
  recordSearch = asyncHandler(async (req: Request & { user?: any }, res: Response) => {
    const { keyword } = req.body;
    const userId = req.user?.id;
    
    if (!keyword) {
      throw new AppError('关键词不能为空', 400);
    }
    
    await seoService.recordSearchKeyword(keyword, userId);
    ApiResponse.success(res, { message: '记录成功' });
  });

  /**
   * 获取热门搜索
   */
  getHotKeywords = asyncHandler(async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const keywords = await seoService.getHotKeywords(limit);
    ApiResponse.success(res, { keywords });
  });
}

export const seoController = new SeoController();
