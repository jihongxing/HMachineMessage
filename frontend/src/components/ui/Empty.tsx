'use client';

interface EmptyProps {
  icon?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export default function Empty({ 
  icon = '📭', 
  title = '暂无数据', 
  description,
  action 
}: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
