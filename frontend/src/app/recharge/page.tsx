'use client';

import { useState, useEffect } from 'react';

const RECHARGE_OPTIONS = [
  { amount: 100, bonus: 10 },
  { amount: 500, bonus: 50 },
  { amount: 1000, bonus: 150 },
  { amount: 2000, bonus: 350 },
];

interface RechargeRecord {
  id: string;
  amount: number;
  status: number;
  createdAt: string;
}

export default function RechargePage() {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [history, setHistory] = useState<RechargeRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recharge/history`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await res.json();
      if (data.code === 0 && data.data?.list) {
        setHistory(data.data.list);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRecharge = async () => {
    const amount = customAmount ? parseFloat(customAmount) : selectedAmount;
    if (isNaN(amount) || amount < 1 || amount > 10000) {
      alert('充值金额范围：1-10000元');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/recharge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          amount,
          payMethod: 'wechat',
        }),
      });
      const data = await res.json();
      if (data.code === 0) {
        alert('充值订单已创建，请完成支付');
        fetchHistory();
      } else {
        alert(data.message || '创建订单失败');
      }
    } catch (error) {
      console.error(error);
      alert('创建订单失败');
    } finally {
      setLoading(false);
    }
  };

  const getBonus = (amount: number) => {
    const option = RECHARGE_OPTIONS.find(opt => opt.amount === amount);
    if (option) {
      return option.bonus;
    }
    
    // 自定义金额按最接近的档位计算
    for (let i = RECHARGE_OPTIONS.length - 1; i >= 0; i--) {
      if (amount >= RECHARGE_OPTIONS[i].amount) {
        return Math.floor((amount / RECHARGE_OPTIONS[i].amount) * RECHARGE_OPTIONS[i].bonus);
      }
    }
    return 0;
  };

  const currentAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const bonus = getBonus(currentAmount);

  return (
    <div className="container py-4 md:py-6 max-w-4xl">
      <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">账户充值</h1>

      {/* 充值金额选择 */}
      <div className="card mb-4 md:mb-6">
        <h2 className="font-bold mb-3 md:mb-4 text-base md:text-lg">选择充值金额</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
          {RECHARGE_OPTIONS.map((option) => (
            <button
              key={option.amount}
              onClick={() => {
                setSelectedAmount(option.amount);
                setCustomAmount('');
              }}
              className="card p-3 md:p-4 text-center transition"
              style={{
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: selectedAmount === option.amount && !customAmount 
                  ? 'var(--color-primary)' 
                  : 'var(--border-default)',
                backgroundColor: selectedAmount === option.amount && !customAmount
                  ? 'var(--bg-hover)'
                  : 'var(--bg-card)',
              }}
            >
              <div className="text-lg md:text-xl font-bold mb-1">¥{option.amount}</div>
              <div className="text-xs md:text-sm" style={{ color: 'var(--color-success)' }}>
                送¥{option.bonus}
              </div>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">自定义金额</label>
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="输入充值金额（1-10000元）"
            className="input"
          />
        </div>

        {/* 金额汇总 */}
        <div 
          className="rounded-lg p-3 md:p-4 mb-4"
          style={{ backgroundColor: 'var(--bg-hover)' }}
        >
          <div className="flex justify-between mb-2 text-sm md:text-base">
            <span>充值金额</span>
            <span className="font-bold">¥{currentAmount}</span>
          </div>
          <div className="flex justify-between mb-2 text-sm md:text-base">
            <span>赠送金额</span>
            <span className="font-bold" style={{ color: 'var(--color-success)' }}>
              ¥{bonus}
            </span>
          </div>
          <div 
            className="border-t pt-2 flex justify-between"
            style={{ borderColor: 'var(--border-divider)' }}
          >
            <span className="font-bold text-base md:text-lg">到账金额</span>
            <span className="font-bold text-xl md:text-2xl" style={{ color: 'var(--color-error)' }}>
              ¥{currentAmount + bonus}
            </span>
          </div>
        </div>

        <button
          onClick={handleRecharge}
          disabled={loading || currentAmount < 1}
          className="btn btn-primary w-full"
          style={{
            opacity: loading || currentAmount < 1 ? 0.5 : 1,
            cursor: loading || currentAmount < 1 ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '处理中...' : '立即充值'}
        </button>
      </div>

      {/* 充值记录 */}
      <div className="card">
        <h2 className="font-bold mb-3 md:mb-4 text-base md:text-lg">充值记录</h2>
        {history.length === 0 ? (
          <p className="text-center py-6" style={{ color: 'var(--text-secondary)' }}>
            暂无充值记录
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="pb-2 border-b"
                style={{ borderColor: 'var(--border-divider)' }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-base md:text-lg">¥{item.amount}</span>
                  <span 
                    className="text-xs md:text-sm px-2 py-1 rounded"
                    style={{
                      backgroundColor: item.status === 1 ? '#f6ffed' : '#fff7e6',
                      color: item.status === 1 ? '#52c41a' : '#d89614',
                    }}
                  >
                    {item.status === 1 ? '已完成' : '待支付'}
                  </span>
                </div>
                <div className="text-xs md:text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
                  {new Date(item.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
