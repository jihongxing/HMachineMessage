import { Response } from 'express';
import { rechargeService } from '../services/recharge.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const createRechargeSchema = z.object({
  amount: z.number().min(1).max(10000),
  payMethod: z.enum(['wechat', 'alipay']),
});

export const createRecharge = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, payMethod } = createRechargeSchema.parse(req.body);
  const userId = req.userId!;

  const result = await rechargeService.createRecharge(userId, amount, payMethod);
  res.json(successResponse(result));
});

export const getRechargeHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const userId = req.userId!;

  const result = await rechargeService.getRechargeHistory(userId, page, pageSize);
  res.json(successResponse(result));
});
