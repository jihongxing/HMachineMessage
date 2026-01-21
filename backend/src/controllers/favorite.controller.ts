import { Response } from 'express';
import { favoriteService } from '../services/favorite.service';
import { asyncHandler } from '../utils/asyncHandler';
import { successResponse } from '../utils/response';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth';

const addFavoriteSchema = z.object({
  equipmentId: z.string(),
});

export const addFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { equipmentId } = addFavoriteSchema.parse(req.body);
  const userId = req.userId!;

  const result = await favoriteService.addFavorite(userId, BigInt(equipmentId));
  res.json(successResponse(result));
});

export const removeFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const equipmentId = BigInt(req.params.equipmentId);
  const userId = req.userId!;

  const result = await favoriteService.removeFavorite(userId, equipmentId);
  res.json(successResponse(result));
});

export const getMyFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 20;
  const userId = req.userId!;

  const result = await favoriteService.getMyFavorites(userId, page, pageSize);
  res.json(successResponse(result));
});

export const checkFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const equipmentId = BigInt(req.params.equipmentId);
  const userId = req.userId!;

  const result = await favoriteService.checkFavorite(userId, equipmentId);
  res.json(successResponse(result));
});
