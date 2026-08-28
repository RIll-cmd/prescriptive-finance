'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useSafeToSpendStore } from '@/stores/safe-to-spend-store';
import { useAuthStore } from '@/stores/auth-store';

export const SafeToSpendWidget: React.FC = () => {
  const { data, fetchSafeToSpend, openBreakdownModal, isLoading } = useSafeToSpendStore();
  const { user } = useAuthStore();

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
    <section className="glass-card p-5 relative overflow-hidden flex flex-col justify-between">
      {/* Background neon ambient orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#3869D2]/20 rounded-full blur-3xl pointer-events-none" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px] text-[#34d399]">verified_user</span>
            <h2 className="text-[0.95rem] font-bold text-white/90 tracking-tight">Safe-to-Spend</h2>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider border ${statusInfo.class}`}>
            {statusInfo.label}
          </span>
        </div>

        {/* Hero Amount */}
        <div className="my-3">
          <span className="text-[0.68rem] text-white/40 font-bold uppercase tracking-wider block mb-0.5">
            Daily Allowance
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[2rem] font-black text-white tracking-tight tabular-nums drop-shadow-[0_0_12px_rgba(52,211,153,0.3)]">
              {currencySymbol}{Number(data?.safe_daily || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[0.82rem] text-white/40 font-medium">/ today</span>
          </div>

          <p className="text-[0.75rem] text-white/60 mt-1 line-clamp-1">
            {data?.planning_horizon_label} ({currencySymbol}{Number(data?.flexible_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })} flexible)
          </p>
        </div>

        {/* Protection checklist */}
        <div className="space-y-1.5 pt-2 border-t border-white/[0.06] text-[0.72rem] text-white/60">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[14px] text-emerald-400">check_circle</span>
            <span>Upcoming bills covered ({currencySymbol}{Number(data?.upcoming_bills || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-rounded text-[14px] text-emerald-400">check_circle</span>
            <span>Goal reserves set aside ({currencySymbol}{Number(data?.goal_allocations || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })})</span>
          </div>
          {Number(data?.emergency_reserve || 0) > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-rounded text-[14px] text-amber-400">shield</span>
              <span>Emergency reserve protected ({currencySymbol}{Number(data?.emergency_reserve || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })})</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center gap-2 pt-4">
        <button
          type="button"
          onClick={openBreakdownModal}
          className="flex-1 py-2 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] text-white/80 text-[0.75rem] font-semibold transition-all text-center"
        >
          View Breakdown
        </button>
        <Link
          href="/safe-to-spend"
          className="py-2 px-3 rounded-[8px] bg-gradient-to-r from-[#3869D2] to-[#C57CF9] text-white text-[0.75rem] font-bold shadow-[0_2px_8px_rgba(56,105,210,0.3)] hover:opacity-95 transition-all text-center flex items-center gap-1"
        >
          <span>Forecast</span>
          <span className="material-symbols-rounded text-[14px]">arrow_forward</span>
        </Link>
      </div>
    </section>
  );
};

export default SafeToSpendWidget;
