'use client';

import React, { useEffect, useState } from 'react';
import { AnimatedCard } from '../ui/AnimatedCard';
import { useAuthStore } from '@/stores/auth-store';

export const BalanceCard: React.FC = () => {
  const { user, totalBalance } = useAuthStore();
  const [balance, setBalance] = useState<number>(0);

  // Target amount: use real total liquid balance if user has sources, else default 18,987.19
  const target = totalBalance > 0 ? totalBalance : 18987.19;
  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';
  const cardHolderName = user?.first_name
    ? `${user.first_name} ${user.last_name || ''}`.trim().toUpperCase()
    : 'ALYA GARRISON';

  useEffect(() => {
    const dur = 1800;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const e = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setBalance(target * e);
      if (t < 1) requestAnimationFrame(tick);
    };

    const frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return (
    <section className="glass-card balance-card">
      <div className="card-inner">
        {/* Header */}
        <div className="flex items-center justify-between mb-[18px]">
          <h2 className="text-[0.95rem] font-semibold text-white/70 tracking-[-0.01em]">
            Total Balance
          </h2>
          <button
            aria-label="Add balance"
            className="w-7 h-7 rounded-[6px] bg-transparent border-none text-white/30 hover:text-[#C57CF9] hover:bg-[#C57CF9]/[0.06] hover:scale-110 flex items-center justify-center transition-all duration-200"
          >
            <span className="material-symbols-rounded text-[20px]">add_circle</span>
          </button>
        </div>

        {/* Balance Amount */}
        <div className="mb-5">
          <span className="text-[1.2rem] font-medium text-white/50 align-super mr-0.5">{currencySymbol}</span>
          <span className="text-[2.2rem] font-black tracking-[-0.04em] bg-gradient-to-br from-[#3869D2] to-[#C57CF9] bg-clip-text text-transparent tabular-nums balance-amount-glow inline-block">
            {balance.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>

        {/* 3D Animated Card */}
        <AnimatedCard
          cardNumber="4218 •••• •••• 1208"
          cardHolder={cardHolderName}
          expiry="09/28"
        />

        {/* Bottom Row */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-baseline">
            <span className="text-[0.9rem] font-medium text-white/50 mr-0.5">{currencySymbol}</span>
            <span className="text-[1.5rem] font-bold text-white tabular-nums">
              {totalBalance > 0 ? (totalBalance * 0.12).toFixed(0) : '1,209'}
            </span>
          </div>

          <button
            aria-label="Next card"
            className="group relative w-[38px] h-[38px] rounded-full bg-gradient-to-br from-[#3869D2] to-[#C57CF9] border-none text-white flex items-center justify-center cursor-pointer shadow-[0_4px_30px_rgba(56,105,210,0.2),0_4px_30px_rgba(197,124,249,0.15)] hover:scale-110 hover:shadow-[0_6px_28px_rgba(56,105,210,0.4),0_6px_28px_rgba(197,124,249,0.4)] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden"
          >
            <span className="material-symbols-rounded text-[20px]">arrow_forward</span>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default BalanceCard;
