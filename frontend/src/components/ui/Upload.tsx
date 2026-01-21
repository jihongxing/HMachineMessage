'use client';

import { useState } from 'react';
import { uploadApi } from '@/lib/api';
import { compressImage } from '@/lib/utils/imageCompress';
import { useAppStore, useUserStore } from '@/lib/store';

interface UploadProps {
  value?: string[];
  onChange?: (urls: string[]) => void;
  maxCount?: number;
  maxSize?: number;
  accept?: string;
  error?: string;
  required?: boolean;
}

export default function Upload({
  value = [],
  onChange,
  maxCount = 9,
  maxSize = 5,
  accept = 'image/jpeg,image/jpg,image/png,image/webp',
  error,
  required
}: UploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const { showToast } = useAppStore();
  const { isLoggedIn } = useUserStore();

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // 检查登录状态
    if (!isLoggedIn) {
      showToast({ type: 'error', message: '请先登录' });
      return;
    }

    const fileArray = Array.from(files);
    
    if (value.length + fileArray.length > maxCount) {
      showToast({ type: 'error', message: `最多上传${maxCount}张图片` });
      return;
    }

    setUploading(true);

    try {
      const uploadPromises = fileArray.map(async (file) => {
        // 验证文件大小
        if (file.size > maxSize * 1024 * 1024) {
          throw new Error(`图片大小不能超过${maxSize}MB`);
        }

        // 压缩图片
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1080,
          quality: 0.8,
        });

        // 上传
        const url = await uploadApi.upload(compressed, (percent) => {
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        });

        return url;
      });

      const urls = await Promise.all(uploadPromises);
      onChange?.([...value, ...urls]);
      showToast({ type: 'success', message: '上传成功' });
    } catch (error: any) {
      showToast({ type: 'error', message: error.message });
    } finally {
      setUploading(false);
      setProgress({});
    }
  };

  const handleRemove = (index: number) => {
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange?.(newValue);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {/* 已上传图片 */}
        {value.map((url, index) => (
          <div key={url} className="relative group">
            <img
              src={url}
              alt=""
              className="w-full h-32 object-cover rounded border"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm"
              >
                删除
              </button>
            </div>
          </div>
        ))}

        {/* 上传按钮 */}
        {value.length < maxCount && (
          <label className="w-full h-32 border-2 border-dashed rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50">
            <input
              type="file"
              multiple
              accept={accept}
              onChange={(e) => handleUpload(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            <div className="text-center">
              <div className="text-3xl text-gray-400">+</div>
              <div className="text-sm text-gray-600 mt-1">上传图片</div>
            </div>
          </label>
        )}
      </div>

      {/* 上传进度 */}
      {uploading && Object.keys(progress).length > 0 && (
        <div className="mt-2 space-y-1">
          {Object.entries(progress).map(([name, percent]) => (
            <div key={name} className="flex items-center gap-2 text-sm">
              <span className="flex-shrink-0 w-32 truncate">{name}</span>
              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="flex-shrink-0 w-12 text-right">{percent}%</span>
            </div>
          ))}
        </div>
      )}

      {/* 错误提示 */}
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}

      {/* 提示信息 */}
      <p className="text-gray-600 text-sm mt-1">
        支持jpg/png/webp格式，单张最大{maxSize}MB，最多{maxCount}张
      </p>
    </div>
  );
}
