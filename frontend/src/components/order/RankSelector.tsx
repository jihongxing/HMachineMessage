'use client';

interface RankSelectorProps {
  value: 'recommend' | 'top';
  onChange: (value: 'recommend' | 'top') => void;
}

export default function RankSelector({ value, onChange }: RankSelectorProps) {
  const options = [
    {
      value: 'recommend' as const,
      label: '推荐位',
      description: '在列表中优先展示',
      icon: '⭐'
    },
    {
      value: 'top' as const,
      label: '置顶位',
      description: '在列表顶部固定展示',
      icon: '🔝'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`card text-left transition ${
            value === option.value
              ? 'border-2 border-primary bg-primary/5'
              : 'hover:border-gray-300'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{option.icon}</div>
            <div className="flex-1">
              <h3 className="font-bold mb-1">{option.label}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {option.description}
              </p>
            </div>
            {value === option.value && (
              <div className="text-primary text-xl">✓</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
