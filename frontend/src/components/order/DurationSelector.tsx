'use client';

interface DurationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export default function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const presets = [1, 3, 6, 12];

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        {presets.map((months) => (
          <button
            key={months}
            onClick={() => onChange(months)}
            className={`btn ${
              value === months ? 'btn-primary' : ''
            }`}
          >
            {months}个月
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600 dark:text-gray-400">自定义：</label>
        <input
          type="number"
          min="1"
          max="12"
          value={value}
          onChange={(e) => onChange(Math.max(1, Math.min(12, parseInt(e.target.value) || 1)))}
          className="input w-24"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">个月</span>
      </div>
    </div>
  );
}
