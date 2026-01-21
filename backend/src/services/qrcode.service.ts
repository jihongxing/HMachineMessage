import QRCode from 'qrcode';
import { storageProvider } from './storage/provider';
import { logger } from '../utils/logger';

export class QRCodeService {
  /**
   * 生成设备二维码
   */
  async generateEquipmentQRCode(equipmentId: bigint): Promise<string> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const url = `${frontendUrl}/equipment/${equipmentId}`;
      
      // 生成二维码Buffer
      const qrBuffer = await QRCode.toBuffer(url, {
        errorCorrectionLevel: 'M',
        type: 'png',
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });

      // 上传到存储
      const key = `qrcode/${equipmentId}.png`;
      const qrUrl = await storageProvider.upload(qrBuffer, key, 'image/png');

      logger.info(`Generated QR code for equipment ${equipmentId}: ${qrUrl}`);
      return qrUrl;
    } catch (error) {
      logger.error('Failed to generate QR code:', error);
      throw error;
    }
  }

  /**
   * 生成带Logo的二维码
   */
  async generateQRCodeWithLogo(
    equipmentId: bigint,
    logoUrl?: string
  ): Promise<string> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const url = `${frontendUrl}/equipment/${equipmentId}`;
      
      // 生成二维码DataURL
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'H', // 高容错率以支持Logo
        width: 400,
        margin: 2,
      });

      // 如果有Logo，可以在这里使用Sharp合成
      // 简化版本：直接返回二维码
      const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, '');
      const qrBuffer = Buffer.from(base64Data, 'base64');

      const key = `qrcode/${equipmentId}.png`;
      const qrUrl = await storageProvider.upload(qrBuffer, key, 'image/png');

      return qrUrl;
    } catch (error) {
      logger.error('Failed to generate QR code with logo:', error);
      throw error;
    }
  }

  /**
   * 批量生成二维码
   */
  async batchGenerateQRCodes(equipmentIds: bigint[]): Promise<Map<bigint, string>> {
    const results = new Map<bigint, string>();
    
    for (const id of equipmentIds) {
      try {
        const qrUrl = await this.generateEquipmentQRCode(id);
        results.set(id, qrUrl);
      } catch (error) {
        logger.error(`Failed to generate QR code for equipment ${id}:`, error);
      }
    }

    return results;
  }
}

export const qrcodeService = new QRCodeService();
