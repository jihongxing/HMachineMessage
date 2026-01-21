'use client';

interface RegionSelectorProps {
  value: 'province' | 'city' | 'county';
  onChange: (value: 'province' | 'city' | 'county') => void;
  equipmentRegion?: { province: string; city: string; county: string };
}

export default function RegionSelector({ value, onChange, equipmentRegion }: RegionSelectorProps) {
  const options = [
    {
      value: 'province' as const,
      label: '省级推广',
      description: equipmentRegion ? `覆盖${equipmentRegion.province}全省` : '覆盖全省范围',
      icon: '🌐'
    },
    {
      value: 'city' as const,
      label: '市级推广',
      description: equipmentRegion ? `覆盖${equipmentRegion.city}全市` : '覆盖全市范围',
      icon: '🏙️'
    },
    {
      value: 'county' as const,
      label: '区县推广',
      description: equipmentRegion ? `覆盖${equipmentRegion.county}` : '覆盖区县范围',
      icon: '📍'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <div className="text-2xl">{option.icon}</div>
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
