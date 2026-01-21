import { Client } from 'minio';
import { StorageProvider } from './provider';
import { config } from '../../config';

export class MinIOProvider implements StorageProvider {
  private client: Client;
  private bucket: string;

  constructor() {
    this.client = new Client({
      endPoint: config.storage.minio.endpoint,
      port: config.storage.minio.port,
      useSSL: config.storage.minio.useSSL,
      accessKey: config.storage.minio.accessKey,
      secretKey: config.storage.minio.secretKey,
    });
    this.bucket = config.storage.minio.bucket;

    this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        console.log(`Creating bucket: ${this.bucket}`);
        await this.client.makeBucket(this.bucket, 'us-east-1');
        // 设置公开读权限
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucket}/*`],
            },
          ],
        };
        await this.client.setBucketPolicy(this.bucket, JSON.stringify(policy));
        console.log(`Bucket ${this.bucket} created successfully`);
      }
    } catch (error: any) {
      console.error('Bucket initialization error:', error);
      // 忽略bucket已存在错误
      if (error.code !== 'BucketAlreadyOwnedByYou' && error.code !== 'BucketAlreadyExists') {
        throw error;
      }
    }
  }

  async upload(file: Buffer, key: string, mimeType?: string): Promise<string> {
    try {
      await this.client.putObject(this.bucket, key, file, file.length, {
        'Content-Type': mimeType || 'image/webp',
      });
      return this.getUrl(key);
    } catch (error: any) {
      console.error('MinIO upload error:', error);
      throw new Error(`MinIO上传失败: ${error.message}`);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.removeObject(this.bucket, key);
  }

  getUrl(key: string): string {
    const cdnUrl = config.storage.minio.cdnUrl;
    if (cdnUrl) {
      return `${cdnUrl}/${key}`;
    }
    const { endpoint, port, useSSL } = config.storage.minio;
    const protocol = useSSL ? 'https' : 'http';
    return `${protocol}://${endpoint}:${port}/${this.bucket}/${key}`;
  }
}

export const minioProvider = new MinIOProvider();
