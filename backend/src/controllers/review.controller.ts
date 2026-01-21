import { Response } from 'express';
import { reviewService } from '../services/review.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';
import { Request } from 'express';

const createReviewSchema = z.object({
  equipmentId: z.string(),
  rating: z.number().min(1).max(5),
  content: z.string().min(10).max(500),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const updateReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  content: z.string().min(10).max(500),
  images: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

const reportReviewSchema = z.object({
  reason: z.string().min(5).max(200),
  images: z.array(z.string()).optional(),
});

export const createReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { equipmentId, rating, content, images, tags } = createReviewSchema.parse(req.body);
  const userId = req.userId!;

  const result = await reviewService.createReview(
    userId,
    BigInt(equipmentId),
    rating,
    content,
    images,
    tags
  );
  res.json(successResponse(result));
});

export const updateReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviewId = BigInt(req.params.id);
  const { rating, content, images, tags } = updateReviewSchema.parse(req.body);
  const userId = req.userId!;

  const result = await reviewService.updateReview(reviewId, userId, rating, content, images, tags);
  res.json(successResponse(result));
});

export const getEquipmentReviews = asyncHandler(async (req: Request, res: Response) => {
  const equipmentId = BigInt(req.params.equipmentId);
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const sort = (req.query.sort as 'time' | 'rating') || 'time';

  const result = await reviewService.getEquipmentReviews(equipmentId, page, pageSize, sort);
  res.json(successResponse(result));
});

export const reportReview = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviewId = BigInt(req.params.id);
  const { reason, images } = reportReviewSchema.parse(req.body);
  const reporterId = req.userId!;

  const result = await reviewService.reportReview(reviewId, reporterId, reason, images);
  res.json(successResponse(result));
});
