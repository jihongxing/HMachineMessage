import { Response } from 'express';
import { historyService } from '../services/history.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth';

export const getViewHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 30;
  const userId = req.userId!;

  const result = await historyService.getViewHistory(userId, page, pageSize);
  res.json(successResponse(result));
});

export const clearHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.userId!;

  const result = await historyService.clearHistory(userId);
  res.json(successResponse(result));
});
