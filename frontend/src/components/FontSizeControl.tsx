'use client';

import { useState } from 'react';
import { useThemeStore } from '@/lib/theme';

export default function FontSizeControl() {
  const { fontScale, setFontScale } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const scales = [
    { value: 0.9, label: '小' },
    { value: 1, label: '标准' },
    { value: 1.1, label: '中' },
    { value: 1.2, label: '大' },
    { value: 1.3, label: '特大' },
  ] as const;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="字体大小"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 p-2">
            {scales.map((scale) => (
              <button
                key={scale.value}
                onClick={() => {
                  setFontScale(scale.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition ${
                  fontScale === scale.value ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : ''
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
