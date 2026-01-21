import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { initRedis } from './middleware/rateLimit';
import routes from './routes';

const app = express();

// 中间件
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 反爬虫中间件
import { antiCrawler } from './middleware/antiCrawler';
app.use(antiCrawler);

// 请求日志
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// API路由
app.use('/api/v1', routes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null,
  });
});

// 错误处理
app.use(errorHandler);

// 启动服务器
const start = async () => {
  try {
    // 强制检查JWT密钥
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'dev-secret-key') {
      logger.error('JWT_SECRET must be set in production environment');
      if (config.env === 'production') {
        process.exit(1);
      }
      logger.warn('Using default JWT_SECRET in development mode');
    }
    
    await initRedis();
    
    // 启动定时任务
    const { cronService } = await import('./services/cron.service');
    cronService.start();
    
    app.listen(config.port, () => {
      logger.info(`Server running on http://localhost:${config.port}`);
      logger.info(`Environment: ${config.env}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

start();
