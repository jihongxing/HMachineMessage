import Link from 'next/link';
import Image from 'next/image';

interface EquipmentCardProps {
  id: string;
  model: string;
  category1: string;
  category2: string;
  city: string;
  county: string;
  price: number;
  priceUnit: string;
  images: string[];
  viewCount?: number;
  rankLevel?: number; // 0普通/1推荐/2置顶
}

export default function EquipmentCard({ 
  id, 
  model, 
  category1, 
  category2, 
  city, 
  county, 
  price, 
  priceUnit, 
  images, 
  viewCount,
  rankLevel = 0
}: EquipmentCardProps) {
  const isTop = rankLevel === 2;
  const isRecommend = rankLevel === 1;

  return (
    <Link 
      href={`/equipment/${id}`} 
      className={`bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden relative ${
        isTop ? 'ring-2 ring-orange-500' : isRecommend ? 'ring-1 ring-blue-400' : ''
      }`}
    >
      {/* 推广标签 */}
      {isTop && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-orange-500 text-white text-xs font-medium rounded">
          置顶
        </div>
      )}
      {isRecommend && (
        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded">
          推荐
        </div>
      )}

      <div className="relative w-full h-40 md:h-48 bg-gray-200 dark:bg-gray-700">
        {images?.[0] ? (
          <Image 
            src={images[0]} 
            alt={model} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            暂无图片
          </div>
        )}
      </div>
      <div className="p-3 md:p-4">
        <h3 className="font-bold text-sm md:text-base mb-2 truncate" title={model}>
          {model}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 truncate">
          {category1} / {category2}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
          📍 {city}{county}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-red-600 font-bold text-base md:text-lg">
            ¥{price}
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-0.5">
              /{priceUnit}
            </span>
          </span>
          {viewCount !== undefined && (
            <span className="text-xs text-gray-400">
              👁 {viewCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
