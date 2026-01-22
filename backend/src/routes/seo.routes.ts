import { Router } from 'express';
import { seoController } from '../controllers/seo.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// 获取设备SEO元数据
router.get('/equipment/:id', seoController.getEquipmentSeo);

// 获取分类SEO元数据
router.get('/category', seoController.getCategorySeo);

// 获取地区SEO元数据
router.get('/region', seoController.getRegionSeo);

// 生成sitemap数据（JSON格式，供Next.js使用）
router.get('/sitemap-data', seoController.getSitemapData);

// 生成sitemap.xml
router.get('/sitemap.xml', seoController.generateSitemap);

// 生成robots.txt
router.get('/robots.txt', seoController.generateRobotsTxt);

// 获取结构化数据
router.get('/structured-data/:id', seoController.getStructuredData);

// 获取面包屑结构化数据
router.post('/breadcrumb-data', seoController.getBreadcrumbStructuredData);

// 获取组织结构化数据
router.get('/organization-data', seoController.getOrganizationStructuredData);

// 记录搜索关键词
router.post('/search', seoController.recordSearch);

// 获取热门搜索
router.get('/hot-keywords', seoController.getHotKeywords);

export default router;
