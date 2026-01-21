import Image from 'next/image';

interface ImageOptimizedProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
}

export default function ImageOptimized({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  fill = false,
}: ImageOptimizedProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      className={className}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      quality={80}
      sizes={fill ? '100vw' : undefined}
    />
  );
}
