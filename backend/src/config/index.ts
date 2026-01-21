import dotenv from 'dotenv';

dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  
  database: {
    url: process.env.DATABASE_URL!,
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6380',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  
  // 安全配置
  security: {
    antiCrawler: {
      enabled: process.env.NODE_ENV === 'production' 
        ? true 
        : process.env.ANTI_CRAWLER_ENABLED === 'true',
      checkUserAgent: process.env.NODE_ENV === 'production'
        ? true
        : process.env.ANTI_CRAWLER_CHECK_UA === 'true',
      checkReferer: process.env.NODE_ENV === 'production'
        ? true
        : process.env.ANTI_CRAWLER_CHECK_REFERER === 'true',
      rateLimit: {
        enabled: process.env.ANTI_CRAWLER_RATE_LIMIT !== 'false',
        maxRequests: parseInt(process.env.ANTI_CRAWLER_MAX_REQUESTS || '100', 10),
        windowMs: parseInt(process.env.ANTI_CRAWLER_WINDOW_MS || '60000', 10),
      },
      fingerprint: {
        enabled: process.env.NODE_ENV === 'production'
          ? true
          : process.env.ANTI_CRAWLER_FINGERPRINT === 'true',
        blockDuration: parseInt(process.env.ANTI_CRAWLER_BLOCK_DURATION || '3600', 10),
      },
    },
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制100次请求
  },
  
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    secret: process.env.UPLOAD_SECRET || 'upload-secret-key',
    endpoint: process.env.UPLOAD_ENDPOINT || 'http://localhost:3001/api/v1',
  },
  
  app: {
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:3001',
  },
  
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'minio', // minio/oss/qiniu
    minio: {
      endpoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
      bucket: process.env.MINIO_BUCKET || 'machinery-images',
      cdnUrl: process.env.MINIO_CDN_URL || '',
    },
  },
};
