export interface StorageProvider {
  upload(file: Buffer, key: string, mimeType?: string): Promise<string>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

// 导出存储提供者实例
import { minioProvider } from './minio';
export const storageProvider = minioProvider;
