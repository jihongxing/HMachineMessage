import { Response } from 'express';
import { notificationService } from '../services/notification.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const type = req.query.type as string | undefined;
  const isRead = req.query.isRead === 'true' ? true : req.query.isRead === 'false' ? false : undefined;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const userId = req.userId!;

  const result = await notificationService.getNotifications(userId, type, isRead, page, pageSize);
  res.json(successResponse(result));
});

export const markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notificationId = BigInt(req.params.id);
  const userId = req.userId!;

  const result = await notificationService.markAsRead(notificationId, userId);
  res.json(successResponse(result));
});

export const markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const result = await notificationService.markAllAsRead(userId);
  res.json(successResponse(result));
});

export const getUnreadCount = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const result = await notificationService.getUnreadCount(userId);
  res.json(successResponse(result));
});
