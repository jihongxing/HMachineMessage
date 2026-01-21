'use client';

interface PaymentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  balance?: number;
  amount: number;
  hideBalance?: boolean;
}

export default function PaymentSelector({
  value,
  onChange,
  balance = 0,
  amount,
  hideBalance = false
}: PaymentSelectorProps) {
  const options = [
    { value: 'wechat', label: '微信支付', icon: '💚' },
    { value: 'alipay', label: '支付宝', icon: '💙' },
    ...(!hideBalance ? [{ value: 'balance', label: '余额支付', icon: '💰' }] : [])
  ];

  const isBalanceInsufficient = value === 'balance' && balance < amount;

  return (
    <div className="space-y-3">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          disabled={option.value === 'balance' && balance < amount}
          className={`card w-full text-left transition ${
            value === option.value
              ? 'border-2 border-primary bg-primary/5'
              : 'hover:border-gray-300'
          } ${option.value === 'balance' && balance < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{option.icon}</div>
              <div>
                <div className="font-bold">{option.label}</div>
                {option.value === 'balance' && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    当前余额：¥{balance.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            {value === option.value && (
              <div className="text-primary text-xl">✓</div>
            )}
          </div>
        </button>
      ))}

      {isBalanceInsufficient && (
        <div className="text-sm text-red-600 flex items-center justify-between">
          <span>余额不足，请先充值</span>
          <a href="/recharge" className="btn btn-sm btn-primary">
            去充值
          </a>
        </div>
      )}
    </div>
  );
}
