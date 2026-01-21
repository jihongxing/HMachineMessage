import { Response } from 'express';
import { qrcodeService } from '../services/qrcode.service';
import { prisma } from '../services/prisma';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/errors';
import { ApiResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export class QRCodeController {
  /**
   * 生成设备二维码
   */
  generateQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const userId = req.userId!;

    // 验证设备存在且属于当前用户
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new AppError('设备不存在', 404);
    }

    if (equipment.userId !== userId) {
      throw new AppError('无权操作此设备', 403);
    }

    // 如果已有二维码，直接返回
    if (equipment.qrcodeUrl) {
      return ApiResponse.success(res, { qrcodeUrl: equipment.qrcodeUrl });
    }

    // 生成二维码
    const qrcodeUrl = await qrcodeService.generateEquipmentQRCode(equipmentId);

    // 更新设备记录
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { qrcodeUrl },
    });

    ApiResponse.success(res, { qrcodeUrl });
  });

  /**
   * 重新生成二维码
   */
  regenerateQRCode = asyncHandler(async (req: AuthRequest, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const userId = req.userId!;

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new AppError('设备不存在', 404);
    }

    if (equipment.userId !== userId) {
      throw new AppError('无权操作此设备', 403);
    }

    // 生成新二维码
    const qrcodeUrl = await qrcodeService.generateEquipmentQRCode(equipmentId);

    // 更新设备记录
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: { qrcodeUrl },
    });

    ApiResponse.success(res, { qrcodeUrl });
  });

  /**
   * 记录扫码
   */
  recordScan = asyncHandler(async (req: AuthRequest, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const { source } = req.body;

    // 验证设备存在
    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new AppError('设备不存在', 404);
    }

    // 记录扫码日志
    await prisma.scanLog.create({
      data: {
        equipmentId,
        source: source || 'unknown',
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || null,
      },
    });

    // 更新扫码次数
    await prisma.equipment.update({
      where: { id: equipmentId },
      data: {
        scanCount: { increment: 1 },
      },
    });

    ApiResponse.success(res, { message: '扫码记录成功' });
  });

  /**
   * 获取扫码统计
   */
  getScanStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const userId = req.userId!;

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new AppError('设备不存在', 404);
    }

    if (equipment.userId !== userId) {
      throw new AppError('无权查看此设备统计', 403);
    }

    // 获取扫码记录
    const scanLogs = await prisma.scanLog.findMany({
      where: { equipmentId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // 统计来源分布
    const sourceStats = scanLogs.reduce((acc, log) => {
      const source = log.source || 'unknown';
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 按日期统计
    const dateStats = scanLogs.reduce((acc, log) => {
      const date = log.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    ApiResponse.success(res, {
      totalScans: equipment.scanCount,
      sourceStats,
      dateStats,
      recentScans: scanLogs.slice(0, 20).map(log => ({
        source: log.source,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
      })),
    });
  });

  /**
   * 批量生成二维码
   */
  batchGenerateQRCodes = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.userId!;

    // 获取用户所有已发布的设备
    const equipments = await prisma.equipment.findMany({
      where: {
        userId,
        status: 1, // 已发布
        qrcodeUrl: null, // 未生成二维码
      },
      select: { id: true },
    });

    if (equipments.length === 0) {
      return ApiResponse.success(res, { message: '没有需要生成二维码的设备' });
    }

    const equipmentIds = equipments.map(e => e.id);
    const results = await qrcodeService.batchGenerateQRCodes(equipmentIds);

    // 批量更新
    for (const [id, qrcodeUrl] of results.entries()) {
      await prisma.equipment.update({
        where: { id },
        data: { qrcodeUrl },
      });
    }

    ApiResponse.success(res, {
      message: `成功生成${results.size}个二维码`,
      count: results.size,
    });
  });

  /**
   * 生成设备海报
   */
  generatePoster = asyncHandler(async (req: AuthRequest, res: Response) => {
    const equipmentId = BigInt(req.params.id);
    const userId = req.userId!;

    const equipment = await prisma.equipment.findUnique({
      where: { id: equipmentId },
    });

    if (!equipment) {
      throw new AppError('设备不存在', 404);
    }

    if (equipment.userId !== userId) {
      throw new AppError('无权操作此设备', 403);
    }

    const { posterService } = await import('../services/poster.service');
    const posterUrl = await posterService.generateEquipmentPoster(equipmentId);

    ApiResponse.success(res, { posterUrl });
  });
}

export const qrcodeController = new QRCodeController();
