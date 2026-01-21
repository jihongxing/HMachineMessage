import { Router } from 'express';
import { qrcodeController } from '../controllers/qrcode.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// 重新生成二维码（必须在 /equipment/:id 之前）
router.post('/equipment/:id/regenerate', authenticate, qrcodeController.regenerateQRCode);

// 生成设备二维码
router.post('/equipment/:id', authenticate, qrcodeController.generateQRCode);

// 记录扫码（公开接口）
router.post('/scan/:id', qrcodeController.recordScan);

// 获取扫码统计
router.get('/stats/:id', authenticate, qrcodeController.getScanStats);

// 批量生成二维码
router.post('/batch', authenticate, qrcodeController.batchGenerateQRCodes);

// 生成设备海报
router.post('/poster/:id', authenticate, qrcodeController.generatePoster);

export default router;
