import { createCanvas, loadImage, registerFont } from 'canvas';
import { storageProvider } from './storage/provider';
import { prisma } from './prisma';
import { logger } from '../utils/logger';
import QRCode from 'qrcode';

export class PosterService {
  /**
   * 生成设备海报
   */
  async generateEquipmentPoster(equipmentId: bigint): Promise<string> {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
        include: {
          user: {
            select: { nickname: true, phone: true },
          },
          province: { select: { name: true } },
          city: { select: { name: true } },
          county: { select: { name: true } },
        },
      });

      if (!equipment) {
        throw new Error('设备不存在');
      }

      // 创建画布 750x1334 (常见海报尺寸)
      const canvas = createCanvas(750, 1334);
      const ctx = canvas.getContext('2d');

      // 背景色
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 750, 1334);

      // 设备图片
      const images = equipment.images as string[];
      if (images && images.length > 0) {
        try {
          const img = await loadImage(images[0]);
          const imgWidth = 750;
          const imgHeight = 500;
          ctx.drawImage(img, 0, 0, imgWidth, imgHeight);
        } catch (error) {
          logger.warn('Failed to load equipment image:', error);
          // 使用占位符
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(0, 0, 750, 500);
        }
      } else {
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, 750, 500);
      }

      // 设备信息区域背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 500, 750, 834);

      // 设备型号
      ctx.fillStyle = '#333333';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText(equipment.model, 40, 580);

      // 分类
      ctx.fillStyle = '#666666';
      ctx.font = '32px sans-serif';
      ctx.fillText(`${equipment.category1} / ${equipment.category2}`, 40, 640);

      // 价格
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 56px sans-serif';
      ctx.fillText(`¥${equipment.price}`, 40, 730);
      
      ctx.fillStyle = '#999999';
      ctx.font = '28px sans-serif';
      ctx.fillText(`/ ${equipment.priceUnit === 'day' ? '天' : '小时'}`, 40 + ctx.measureText(`¥${equipment.price}`).width + 10, 730);

      // 位置
      ctx.fillStyle = '#666666';
      ctx.font = '32px sans-serif';
      ctx.fillText(`📍 ${equipment.city?.name || ''}${equipment.county?.name || ''}`, 40, 800);

      // 联系方式
      ctx.fillStyle = '#333333';
      ctx.font = '36px sans-serif';
      ctx.fillText(`联系电话：${equipment.phone}`, 40, 880);

      // 分割线
      ctx.strokeStyle = '#eeeeee';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(40, 940);
      ctx.lineTo(710, 940);
      ctx.stroke();

      // 二维码
      const qrCodeDataUrl = await QRCode.toDataURL(
        `${process.env.FRONTEND_URL}/equipment/${equipmentId}`,
        { width: 200, margin: 0 }
      );
      const qrImg = await loadImage(qrCodeDataUrl);
      ctx.drawImage(qrImg, 275, 1000, 200, 200);

      // 扫码提示
      ctx.fillStyle = '#999999';
      ctx.font = '28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('扫码查看详情', 375, 1250);

      // 转换为Buffer
      const buffer = canvas.toBuffer('image/png');

      // 上传到存储
      const key = `poster/${equipmentId}.png`;
      const posterUrl = await storageProvider.upload(buffer, key, 'image/png');

      logger.info(`Generated poster for equipment ${equipmentId}: ${posterUrl}`);
      return posterUrl;
    } catch (error) {
      logger.error('Failed to generate poster:', error);
      throw error;
    }
  }

  /**
   * 批量生成海报
   */
  async batchGeneratePosters(equipmentIds: bigint[]): Promise<Map<bigint, string>> {
    const results = new Map<bigint, string>();
    
    for (const id of equipmentIds) {
      try {
        const posterUrl = await this.generateEquipmentPoster(id);
        results.set(id, posterUrl);
      } catch (error) {
        logger.error(`Failed to generate poster for equipment ${id}:`, error);
      }
    }

    return results;
  }
}

export const posterService = new PosterService();
