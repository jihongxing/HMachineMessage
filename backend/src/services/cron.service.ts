import cron from 'node-cron';
import { seoService } from './seo.service';
import { logger } from '../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export class CronService {
  /**
   * 启动所有定时任务
   */
  start() {
    // 每天凌晨3点更新sitemap
    cron.schedule('0 3 * * *', async () => {
      logger.info('Starting sitemap update task');
      await this.updateSitemap();
    });

    // 每小时检查排名到期
    cron.schedule('0 * * * *', async () => {
      logger.info('Starting rank expiration check');
      await this.checkRankExpiration();
    });

    logger.info('Cron jobs started');
  }

  /**
   * 更新sitemap
   */
  private async updateSitemap() {
    try {
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

      // 保存到public目录
      const publicDir = path.join(__dirname, '../../public');
      await fs.mkdir(publicDir, { recursive: true });
      await fs.writeFile(path.join(publicDir, 'sitemap.xml'), xml);

      logger.info(`Sitemap updated with ${urls.length} URLs`);
    } catch (error) {
      logger.error('Failed to update sitemap:', error);
    }
  }

  /**
   * 检查排名到期
   */
  private async checkRankExpiration() {
    try {
      const { prisma } = await import('./prisma');
      
      // 查找已到期的排名
      const expiredEquipments = await prisma.equipment.findMany({
        where: {
          rankLevel: { gt: 0 },
          rankExpire: { lte: new Date() },
        },
      });

      // 重置排名
      for (const equipment of expiredEquipments) {
        await prisma.equipment.update({
          where: { id: equipment.id },
          data: {
            rankLevel: 0,
            rankExpire: null,
            rankRegion: null,
          },
        });

        // 发送到期通知
        await prisma.notification.create({
          data: {
            userId: equipment.userId,
            type: 'system',
            title: '排名已到期',
            content: `您的设备"${equipment.model}"的排名已到期，已恢复为普通展示。`,
            relatedId: equipment.id,
          },
        });
      }

      if (expiredEquipments.length > 0) {
        logger.info(`Reset ${expiredEquipments.length} expired rankings`);
      }
    } catch (error) {
      logger.error('Failed to check rank expiration:', error);
    }
  }
}

export const cronService = new CronService();
