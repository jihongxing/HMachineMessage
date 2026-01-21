import jwt from 'jsonwebtoken';
import sharp from 'sharp';
import { prisma } from './prisma';
import { StorageProvider } from './storage/provider';
import { MinIOProvider } from './storage/minio';
import { config } from '../config';
import { BadRequestError, NotFoundError } from '../utils/errors';
// 分页辅助函数
function getPagination(page: number, pageSize: number) {
  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
  };
}

interface UploadToken {
  token: string;
  uploadUrl: string;
  expireAt: Date;
  maxSize: number;
  allowedTypes: string[];
}

interface UploadResult {
  key: string;
  url: string;
  size: number;
  width: number;
  height: number;
  mimeType: string;
}

export class UploadService {
  private storage: StorageProvider;

  constructor() {
    // 根据配置选择存储提供者
    this.storage = new MinIOProvider();
  }

  async generateToken(userId: bigint, type: string): Promise<UploadToken> {
    const token = jwt.sign(
      { userId: userId.toString(), type },
      config.upload.secret,
      { expiresIn: '1h' }
    );

    return {
      token,
      uploadUrl: `${config.app.baseUrl}/api/v1/upload`,
      expireAt: new Date(Date.now() + 3600000),
      maxSize: 5 * 1024 * 1024,
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    };
  }

  async upload(file: Express.Multer.File, userId: bigint): Promise<UploadResult> {
    try {
      // 处理图片
      const processed = await this.processImage(file.buffer);

      // 获取图片信息
      const metadata = await sharp(processed).metadata();

      // 生成文件key
      const ext = 'webp';
      const key = this.generateFileKey(userId, 'equipment', ext);

      // 上传到存储
      const url = await this.storage.upload(processed, key);

      // 记录到数据库
      await prisma.$executeRaw`
        INSERT INTO images (user_id, key, url, size, width, height, mime_type, uploaded_at)
        VALUES (${userId}, ${key}, ${url}, ${processed.length}, ${metadata.width}, ${metadata.height}, 'image/webp', NOW())
      `;

      return {
        key,
        url,
        size: processed.length,
        width: metadata.width!,
        height: metadata.height!,
        mimeType: 'image/webp',
      };
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new BadRequestError(`上传失败: ${error.message}`);
    }
  }

  async delete(key: string, userId: bigint): Promise<void> {
    // 检查文件是否属于该用户
    const image = await prisma.$queryRaw<any[]>`
      SELECT * FROM images WHERE key = ${key} AND user_id = ${userId}
    `;

    if (image.length === 0) {
      throw new NotFoundError('文件不存在');
    }

    // 从存储删除
    await this.storage.delete(key);

    // 从数据库删除
    await prisma.$executeRaw`
      DELETE FROM images WHERE key = ${key}
    `;
  }

  async getUserImages(userId: bigint, pagination: { page: number; pageSize: number }) {
    const { skip, take } = getPagination(pagination.page, pagination.pageSize);

    const [images, total] = await Promise.all([
      prisma.$queryRaw<any[]>`
        SELECT * FROM images 
        WHERE user_id = ${userId}
        ORDER BY uploaded_at DESC
        LIMIT ${take} OFFSET ${skip}
      `,
      prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM images WHERE user_id = ${userId}
      `,
    ]);

    return {
      data: images,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total: Number(total[0].count),
        totalPages: Math.ceil(Number(total[0].count) / pagination.pageSize),
      },
    };
  }

  private async processImage(buffer: Buffer): Promise<Buffer> {
    // 检查是否已经是webp格式且尺寸合适
    const metadata = await sharp(buffer).metadata();
    
    // 如果已经是webp且尺寸不超过1920x1080，直接返回
    if (metadata.format === 'webp' && 
        metadata.width! <= 1920 && 
        metadata.height! <= 1080) {
      return buffer;
    }
    
    // 否则进行转换
    return sharp(buffer)
      .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 3 })
      .toBuffer();
  }

  private generateFileKey(userId: bigint, type: string, ext: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 15);

    return `${type}/${year}/${month}/${day}/${userId}_${random}.${ext}`;
  }
}
