'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSafeToSpendStore } from '@/stores/safe-to-spend-store';
import { useAuthStore } from '@/stores/auth-store';
import { useDashboardStore } from '@/stores/dashboard-store';

export const SafeToSpendWidget: React.FC = () => {
  const { data, fetchSafeToSpend, openBreakdownModal, isLoading } = useSafeToSpendStore();
  const { user } = useAuthStore();
  const { toggleWidget } = useDashboardStore();

  useEffect(() => {
    fetchSafeToSpend();
  }, [fetchSafeToSpend]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'HEALTHY':
        return { label: 'Healthy Pace', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
      case 'CAUTION':
        return { label: 'Caution', class: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
      case 'AT_RISK':
        return { label: 'At Risk', class: 'text-orange-400 bg-orange-500/10 border-orange-500/20' };
      case 'UNSAFE':
        return { label: 'Shortfall Alert', class: 'text-rose-400 bg-rose-500/10 border-rose-500/20' };
      default:
        return { label: 'Active', class: 'text-blue-400 bg-blue-500/10 border-blue-500/20' };
    }
  };

  const statusInfo = getStatusBadge(data?.status);

  return (
    <section className="glass-card p-6 h-full relative overflow-hidden flex flex-col justify-between">
      {/* Background neon ambient orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3869D2]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px] text-[#34d399]">verified_user</span>
            <h2 className="text-[0.95rem] font-bold text-white/90 tracking-tight">Safe-to-Spend</h2>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`px-2.5 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${statusInfo.class}`}>
              {statusInfo.label}
            </span>
            <button
              type="button"
              onClick={() => toggleWidget('safe_to_spend')}
              title="Hide Safe-to-Spend from Dashboard"
              aria-label="Hide Safe-to-Spend"
              className="w-6 h-6 rounded-[6px] text-white/20 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all border-none bg-transparent cursor-pointer"
            >
              <span className="material-symbols-rounded text-[16px]">close</span>
            </button>
          </div>
        </div>

        {/* Hero Amount */}
        <div className="py-1">
          <span className="text-[0.68rem] text-white/40 font-bold uppercase tracking-wider block mb-0.5">
            Daily Allowance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[2.2rem] font-black text-white tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              {currencySymbol}{Number(data?.safe_daily || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[0.85rem] text-white/40 font-medium">/ today</span>
          </div>

          <p className="text-[0.78rem] text-white/60 mt-1 line-clamp-1">
            {data?.planning_horizon_label} ({currencySymbol}{Number(data?.flexible_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })} flexible)
          </p>
        </div>

        {/* Safety Metric Progress Bar */}
        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="flex items-center justify-between text-[0.70rem] mb-1.5 font-semibold">
            <span className="text-white/50">Spending Buffer</span>
            <span className="text-emerald-400 font-bold">Protected</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-[#3869D2] w-full" />
          </div>
        </div>

        {/* Protection checklist */}
        <div className="space-y-2 pt-1 text-[0.74rem] text-white/60">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[15px] text-emerald-400">check_circle</span>
            <span>Upcoming bills covered ({currencySymbol}{Number(data?.upcoming_bills || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[15px] text-emerald-400">check_circle</span>
            <span>Goal reserves set aside ({currencySymbol}{Number(data?.goal_allocations || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })})</span>
          </div>
          {Number(data?.emergency_reserve || 0) > 0 && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-[15px] text-amber-400">shield</span>
              <span>Emergency reserve protected ({currencySymbol}{Number(data?.emergency_reserve || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })})</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-4 border-t border-white/[0.04] mt-2">
        <button
          type="button"
          onClick={openBreakdownModal}
          className="flex-1 py-2.5 rounded-[10px] bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-[0.78rem] font-semibold transition-all text-center cursor-pointer border border-white/[0.06]"
        >
          View Breakdown
        </button>
        <Link
          href="/safe-to-spend"
          className="py-2.5 px-4 rounded-[10px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.78rem] font-bold shadow-[0_2px_12px_rgba(56,105,210,0.3)] hover:opacity-95 transition-all text-center flex items-center gap-1.5 no-underline"
        >
          <span>Forecast</span>
          <span className="material-symbols-rounded text-[15px]">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
};

export default SafeToSpendWidget;
