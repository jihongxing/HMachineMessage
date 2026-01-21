import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      code: err.statusCode,
      message: err.message,
      data: null,
    });
  }

  // Prisma错误处理
  if (err.name === 'PrismaClientKnownRequestError') {
    return ApiResponse.error(res, '数据库操作失败', 400);
  }

  // Zod验证错误
  if (err.name === 'ZodError') {
    return ApiResponse.error(res, '参数验证失败', 400);
  }

  // 默认服务器错误
  return ApiResponse.serverError(res, '服务器内部错误');
};
