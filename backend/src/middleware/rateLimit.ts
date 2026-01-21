import { Request, Response, NextFunction } from 'express';
import { createClient } from 'redis';
import { config } from '../config';
import { TooManyRequestsError } from '../utils/errors';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;

export const initRedis = async () => {
  try {
    redisClient = createClient({ url: config.redis.url });
    await redisClient.connect();
    logger.info('Redis connected');
  } catch (error) {
    logger.error('Redis connection failed:', error);
  }
};

export const rateLimit = (options: {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!redisClient) {
      return next();
    }

    const key = `${options.keyPrefix || 'rate_limit'}:${req.ip}`;
    
    try {
      const current = await redisClient.incr(key);
      
      if (current === 1) {
        await redisClient.expire(key, Math.floor(options.windowMs / 1000));
      }

      if (current > options.max) {
        throw new TooManyRequestsError();
      }

      next();
    } catch (error) {
      if (error instanceof TooManyRequestsError) {
        throw error;
      }
      next();
    }
  };
};

export { redisClient };
