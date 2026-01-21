import { Response } from 'express';
import { orderService } from '../services/order.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const createOrderSchema = z.object({
  equipmentId: z.string(),
  rankLevel: z.number().min(1).max(2),
  rankRegion: z.enum(['province', 'city', 'county']),
  duration: z.number().min(1).max(12),
});

const payOrderSchema = z.object({
  payMethod: z.enum(['wechat', 'alipay', 'balance']),
});

const refundOrderSchema = z.object({
  reason: z.string().min(5).max(200),
});

const paymentCallbackSchema = z.object({
  tradeNo: z.string(),
  payMethod: z.string(),
  amount: z.number(),
  sign: z.string(),
});

export const createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { equipmentId, rankLevel, rankRegion, duration } = createOrderSchema.parse(req.body);
  const userId = req.userId!;

  const result = await orderService.createOrder(
    userId,
    BigInt(equipmentId),
    rankLevel,
    rankRegion,
    duration
  );
  res.json(successResponse(result));
});

export const payOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderId = BigInt(req.params.id);
  const { payMethod } = payOrderSchema.parse(req.body);
  const userId = req.userId!;

  const result = await orderService.payOrder(orderId, userId, payMethod);
  res.json(successResponse(result));
});

export const getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
  const status = req.query.status ? parseInt(req.query.status as string) : undefined;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const userId = req.userId!;

  const result = await orderService.getMyOrders(userId, status, page, pageSize);
  res.json(successResponse(result));
});

export const getOrderDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderId = BigInt(req.params.id);
  const userId = req.userId!;

  const result = await orderService.getOrderDetail(orderId, userId);
  res.json(successResponse(result));
});

export const refundOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderId = BigInt(req.params.id);
  const { reason } = refundOrderSchema.parse(req.body);
  const userId = req.userId!;

  const result = await orderService.refundOrder(orderId, userId, reason);
  res.json(successResponse(result));
});

export const paymentCallback = asyncHandler(async (req: AuthRequest, res: Response) => {
  const orderNo = req.params.orderNo;
  const paymentData = paymentCallbackSchema.parse(req.body);

  const result = await orderService.handlePaymentCallback(orderNo, paymentData);
  res.json(successResponse(result));
});
