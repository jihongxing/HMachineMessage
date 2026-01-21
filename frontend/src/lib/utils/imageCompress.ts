import imageCompression from 'browser-image-compression';

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
  } = options;

  try {
    const compressedFile = await imageCompression(file, {
      maxWidthOrHeight: Math.max(maxWidth, maxHeight),
      useWebWorker: true,
      initialQuality: quality,
      maxSizeMB: 2,
    });

    return compressedFile;
  } catch (error) {
    console.error('图片压缩失败:', error);
    return file;
  }
}
