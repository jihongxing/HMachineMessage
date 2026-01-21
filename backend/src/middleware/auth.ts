import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';

export interface AuthRequest extends Request {
  userId?: bigint;
  userLevel?: number;
}

export const authenticate = asyncHandler(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new UnauthorizedError('未提供认证令牌');
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        userLevel: number;
      };

      req.userId = BigInt(decoded.userId);
      req.userLevel = decoded.userLevel;
      next();
    } catch (error) {
      throw new UnauthorizedError('无效的认证令牌');
    }
  }
);

export const requireLevel = (minLevel: number) => {
  return asyncHandler(
    async (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.userLevel || req.userLevel < minLevel) {
        throw new UnauthorizedError('权限不足');
      }
      next();
    }
  );
};
