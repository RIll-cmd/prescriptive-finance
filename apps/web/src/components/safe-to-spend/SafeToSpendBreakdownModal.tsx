'use client';

import React from 'react';
import { useSafeToSpendStore } from '@/stores/safe-to-spend-store';
import { useAuthStore } from '@/stores/auth-store';

export const SafeToSpendBreakdownModal: React.FC = () => {
  const { isBreakdownModalOpen, closeBreakdownModal, data } = useSafeToSpendStore();
  const { user } = useAuthStore();

  if (!isBreakdownModalOpen || !data) return null;

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[12px] animate-[fadeIn_0.2s_ease-out]">
      <div className="glass-card w-full max-w-lg p-6 border border-white/10 rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[22px] text-[#34d399]">calculate</span>
            <h2 className="text-[1.1rem] font-bold text-white tracking-tight">How We Calculate Safe-to-Spend</h2>
          </div>
          <button
            type="button"
            onClick={closeBreakdownModal}
            className="w-8 h-8 rounded-full bg-white/[0.04] text-white/40 hover:text-white flex items-center justify-center transition-all"
          >
            <span className="material-symbols-rounded text-[18px]">close</span>
          </button>
        </div>

        {/* Calculation Table */}
        <div className="space-y-2.5 mb-5 bg-white/[0.02] border border-white/[0.06] p-4 rounded-[14px]">
          {/* 1. Available Money */}
          <div className="flex items-center justify-between text-[0.85rem]">
            <div className="flex items-center gap-2 text-white/80">
              <span className="material-symbols-rounded text-[18px] text-[#3869D2]">account_balance_wallet</span>
              <span>Available Liquid Money</span>
            </div>
            <span className="font-bold text-white tabular-nums">
              {currencySymbol}{Number(data.available_money).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 2. Expected Income */}
          <div className="flex items-center justify-between text-[0.85rem]">
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="material-symbols-rounded text-[18px]">add_circle</span>
              <span>Expected Income (before payday)</span>
            </div>
            <span className="font-bold text-emerald-400 tabular-nums">
              +{currencySymbol}{Number(data.expected_income).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 3. Upcoming Bills */}
          <div className="flex items-center justify-between text-[0.85rem]">
            <div className="flex items-center gap-2 text-rose-400">
              <span className="material-symbols-rounded text-[18px]">receipt_long</span>
              <span>Upcoming Bills & Liabilities</span>
            </div>
            <span className="font-bold text-rose-400 tabular-nums">
              -{currencySymbol}{Number(data.upcoming_bills).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 4. Goal Allocations */}
          <div className="flex items-center justify-between text-[0.85rem]">
            <div className="flex items-center gap-2 text-[#C57CF9]">
              <span className="material-symbols-rounded text-[18px]">flag</span>
              <span>Goal Contributions (Horizon Apportioned)</span>
            </div>
            <span className="font-bold text-[#C57CF9] tabular-nums">
              -{currencySymbol}{Number(data.goal_allocations).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* 5. Emergency Reserve */}
          <div className="flex items-center justify-between text-[0.85rem]">
            <div className="flex items-center gap-2 text-amber-400">
              <span className="material-symbols-rounded text-[18px]">shield</span>
              <span>Protected Emergency Reserve</span>
            </div>
            <span className="font-bold text-amber-400 tabular-nums">
              -{currencySymbol}{Number(data.emergency_reserve).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="h-[1px] bg-white/10 my-2" />

          {/* Flexible Cash Result */}
          <div className="flex items-center justify-between text-[0.95rem] font-bold">
            <span className="text-white">Total Flexible Cash</span>
            <span className="text-[#34d399] tabular-nums text-[1.1rem]">
              {currencySymbol}{Number(data.flexible_cash).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Multi-Horizon Breakdown */}
        <div className="space-y-2 mb-6">
          <span className="text-[0.7rem] font-bold text-white/40 uppercase tracking-wider block">
            Planning Horizons ({data.planning_horizon_days} Days Active)
          </span>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-[10px]">
              <span className="text-[0.65rem] text-white/40 font-bold uppercase block mb-1">Daily Limit</span>
              <span className="text-[1.05rem] font-black text-white tabular-nums">
                {currencySymbol}{Number(data.safe_daily).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                <span className="text-[0.7rem] text-white/40 font-normal">/day</span>
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-[10px]">
              <span className="text-[0.65rem] text-white/40 font-bold uppercase block mb-1">Weekly Limit</span>
              <span className="text-[1.05rem] font-black text-white tabular-nums">
                {currencySymbol}{Number(data.safe_weekly).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                <span className="text-[0.7rem] text-white/40 font-normal">/wk</span>
              </span>
            </div>

            <div className="bg-white/[0.03] border border-white/[0.06] p-3 rounded-[10px]">
              <span className="text-[0.65rem] text-white/40 font-bold uppercase block mb-1">Until Payday</span>
              <span className="text-[1.05rem] font-black text-[#5a8aee] tabular-nums">
                {currencySymbol}{Number(data.safe_until_payday).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                <span className="text-[0.7rem] text-white/40 font-normal">/day</span>
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={closeBreakdownModal}
          className="w-full py-2.5 rounded-[10px] bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-[0.85rem] transition-all"
        >
          Close Breakdown
        </button>
      </div>
    </div>
  );
};

export default SafeToSpendBreakdownModal;
