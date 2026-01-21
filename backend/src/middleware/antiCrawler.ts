import { Request, Response, NextFunction } from 'express';
import { cache } from '../services/cache';
import { logger } from '../utils/logger';
import { config } from '../config';

// 爬虫UA特征
const CRAWLER_UA_PATTERNS = [
  /bot/i,
  /spider/i,
  /crawler/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python/i,
  /java/i,
  /scrapy/i,
  /selenium/i,
  /phantomjs/i,
  /headless/i,
];

// 白名单UA（搜索引擎）
const WHITELIST_UA_PATTERNS = [
  /googlebot/i,
  /bingbot/i,
  /baiduspider/i,
  /yandex/i,
  /duckduckbot/i,
];

export const antiCrawler = async (req: Request, res: Response, next: NextFunction) => {
  const antiCrawlerConfig = config.security.antiCrawler;
  
  if (!antiCrawlerConfig.enabled) {
    return next();
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || '';
  const referer = req.headers['referer'] || '';

  try {
    // 1. 检查是否在黑名单
    const isBlocked = await cache.get(`blocked:${ip}`);
    if (isBlocked) {
      logger.warn(`Blocked IP attempted access: ${ip}`);
      return res.status(403).json({ code: 403, message: '访问被拒绝' });
    }

    // 2. 检查User-Agent
    if (antiCrawlerConfig.checkUserAgent) {
      // 白名单检查
      const isWhitelisted = WHITELIST_UA_PATTERNS.some(pattern => pattern.test(userAgent));
      if (!isWhitelisted) {
        // 爬虫特征检查
        const isCrawler = CRAWLER_UA_PATTERNS.some(pattern => pattern.test(userAgent));
        if (isCrawler) {
          logger.warn(`Crawler detected: ${ip}, UA: ${userAgent}`);
          await blockIP(ip, 'Crawler UA detected', antiCrawlerConfig.fingerprint.blockDuration);
          return res.status(403).json({ code: 403, message: '访问被拒绝' });
        }

        // 空UA检查
        if (!userAgent) {
          logger.warn(`Empty UA: ${ip}`);
          await blockIP(ip, 'Empty UA', antiCrawlerConfig.fingerprint.blockDuration);
          return res.status(403).json({ code: 403, message: '访问被拒绝' });
        }
      }
    }

    // 3. 检查Referer（可选）
    if (antiCrawlerConfig.checkReferer && req.method === 'GET') {
      const allowedDomains = process.env.ALLOWED_DOMAINS?.split(',') || [];
      if (allowedDomains.length > 0 && referer) {
        const isAllowed = allowedDomains.some(domain => referer.includes(domain));
        if (!isAllowed && !referer.includes(req.hostname)) {
          logger.warn(`Invalid referer: ${ip}, Referer: ${referer}`);
        }
      }
    }

    // 4. 频率限制
    if (antiCrawlerConfig.rateLimit.enabled) {
      const key = `rate:${ip}`;
      const requests = await cache.get(key);
      const count = requests ? parseInt(requests) : 0;

      if (count >= antiCrawlerConfig.rateLimit.maxRequests) {
        logger.warn(`Rate limit exceeded: ${ip}, Count: ${count}`);
        await blockIP(ip, 'Rate limit exceeded', antiCrawlerConfig.fingerprint.blockDuration);
        return res.status(429).json({ code: 429, message: '请求过于频繁' });
      }

      await cache.set(key, (count + 1).toString(), Math.floor(antiCrawlerConfig.rateLimit.windowMs / 1000));
    }

    // 5. 指纹识别（可选）
    if (antiCrawlerConfig.fingerprint.enabled) {
      const fingerprint = generateFingerprint(req);
      const fpKey = `fp:${fingerprint}`;
      const fpCount = await cache.get(fpKey);
      
      if (fpCount && parseInt(fpCount) > 50) {
        logger.warn(`Suspicious fingerprint: ${ip}, FP: ${fingerprint}`);
        await blockIP(ip, 'Suspicious fingerprint', antiCrawlerConfig.fingerprint.blockDuration);
        return res.status(403).json({ code: 403, message: '访问被拒绝' });
      }

      await cache.set(fpKey, ((fpCount ? parseInt(fpCount) : 0) + 1).toString(), 3600);
    }

    next();
  } catch (error) {
    logger.error('Anti-crawler middleware error:', error);
    next();
  }
};

async function blockIP(ip: string, reason: string, duration: number) {
  await cache.set(`blocked:${ip}`, reason, duration);
  logger.warn(`IP blocked: ${ip}, Reason: ${reason}, Duration: ${duration}s`);
}

function generateFingerprint(req: Request): string {
  const ua = req.headers['user-agent'] || '';
  const acceptLang = req.headers['accept-language'] || '';
  const acceptEnc = req.headers['accept-encoding'] || '';
  
  const crypto = require('crypto');
  return crypto
    .createHash('md5')
    .update(`${ua}${acceptLang}${acceptEnc}`)
    .digest('hex');
}
