'use client';

import React, { useEffect, useState } from 'react';
import { useSafeToSpendStore, HorizonMode } from '@/stores/safe-to-spend-store';
import { useAuthStore } from '@/stores/auth-store';
import { useContextualTutorial } from '@/hooks/useContextualTutorial';

export default function SafeToSpendPage() {
  // Contextual Onboarding for Safe-to-Spend
  useContextualTutorial('safe-to-spend', 600);

  const {
    data,
    forecast,
    settings,
    activeMode,
    setActiveMode,
    forecastDays,
    setForecastDays,
    fetchSafeToSpend,
    fetchForecast,
    fetchSettings,
    updateSettings,
    openBreakdownModal,
    isLoading,
    isForecastLoading,
  } = useSafeToSpendStore();
  const { user } = useAuthStore();

  const [reserveInput, setReserveInput] = useState('');
  const [isUpdatingReserve, setIsUpdatingReserve] = useState(false);

  useEffect(() => {
    fetchSafeToSpend();
    fetchForecast(30);
    fetchSettings();
  }, [fetchSafeToSpend, fetchForecast, fetchSettings]);

  useEffect(() => {
    if (settings) {
      setReserveInput(settings.emergency_reserve_amount.toString());
    }
  }, [settings]);

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const handleSaveReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reserveInput) return;
    setIsUpdatingReserve(true);
    await updateSettings({
      emergency_reserve_amount: parseFloat(reserveInput),
    });
    setIsUpdatingReserve(false);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'HEALTHY':
        return { label: 'Healthy Pace', class: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 'CAUTION':
        return { label: 'Caution Pace', class: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'AT_RISK':
        return { label: 'At Risk', class: 'text-orange-400 bg-orange-500/10 border-orange-500/30' };
      case 'UNSAFE':
        return { label: 'Shortfall Warning', class: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
      default:
        return { label: 'Active', class: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
    }
  };

  const statusInfo = getStatusBadge(data?.status);

  // Forecast SVG Points generator
  const timeline = forecast?.timeline || [];
  const minBal = forecast?.min_projected_balance || 0;
  const maxBal = Math.max(...timeline.map((t) => t.projected_balance), 1);
  const range = maxBal - minBal || 1;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-[fadeIn_0.4s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.8rem] font-extrabold tracking-[-0.03em] bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
            Safe-to-Spend Decision Center
          </h1>
          <p className="text-[0.82rem] text-white/40 mt-0.5">
            Forward-looking cash flow intelligence protecting your bills, goals, and emergency reserve
          </p>
        </div>

        {/* Horizon Switcher */}
        <div data-tour="safe-spend-controls" className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[12px] self-start sm:self-auto shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
          {(
            [
              { label: 'Until Payday', value: 'UNTIL_PAYDAY' },
              { label: 'This Week', value: 'WEEKLY' },
              { label: 'End of Month', value: 'MONTHLY' },
              { label: 'Today', value: 'DAILY' },
            ] as const
          ).map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setActiveMode(mode.value)}
              className={`px-3 py-1.5 rounded-[9px] text-[0.75rem] font-semibold transition-all whitespace-nowrap ${
                activeMode === mode.value
                  ? 'bg-gradient-to-r from-[#10b981] to-[#34d399] text-black font-bold shadow-[0_2px_12px_rgba(52,211,153,0.3)]'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero Safe-to-Spend Banner */}
      <div data-tour="safe-spend-hero" className="glass-card p-8 rounded-[20px] relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Glow */}
        <div className="absolute -top-16 -left-16 w-56 h-56 bg-[#34d399]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#3869D2]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <span className="material-symbols-rounded text-[24px] text-[#34d399]">verified_user</span>
            <span className="text-[0.8rem] font-bold text-white/50 uppercase tracking-wider">
              {data?.planning_horizon_label} Safe Allowance
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[0.68rem] font-bold uppercase tracking-wider border ${statusInfo.class}`}>
              {statusInfo.label}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-[3.2rem] font-black text-white tracking-tight tabular-nums drop-shadow-[0_0_24px_rgba(52,211,153,0.35)]">
              {currencySymbol}{Number(data?.safe_daily || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
            <span className="text-[1.1rem] text-white/40 font-semibold">/ per day</span>
          </div>

          <p className="text-[0.85rem] text-white/70 max-w-xl leading-relaxed">
            {data?.explanation_summary}
          </p>
        </div>

        {/* Quick Horizon Strip */}
        <div className="relative z-10 grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
          <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-[14px] min-w-[140px]">
            <span className="text-[0.68rem] text-white/40 font-bold uppercase block mb-1">Weekly Safe</span>
            <span className="text-[1.2rem] font-extrabold text-white tabular-nums">
              {currencySymbol}{Number(data?.safe_weekly || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>

          <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-[14px] min-w-[140px]">
            <span className="text-[0.68rem] text-white/40 font-bold uppercase block mb-1">Flexible Total</span>
            <span className="text-[1.2rem] font-extrabold text-[#34d399] tabular-nums">
              {currencySymbol}{Number(data?.flexible_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: Mathematical Transparency Breakdown & Spending Pace Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mathematical Equation Breakdown */}
        <div className="glass-card p-6 rounded-[18px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-[20px] text-[#3869D2]">account_tree</span>
              <h2 className="text-[1.05rem] font-bold text-white tracking-tight">Equation Breakdown</h2>
            </div>
            <span className="text-[0.72rem] text-white/40 font-semibold">{data?.planning_horizon_days}d Horizon</span>
          </div>

          <div className="space-y-3 bg-white/[0.02] border border-white/[0.05] p-4 rounded-[14px] text-[0.82rem]">
            <div className="flex items-center justify-between text-white/80">
              <span>Available Liquid Money</span>
              <span className="font-bold text-white tabular-nums">
                {currencySymbol}{Number(data?.available_money || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-emerald-400">
              <span>(+) Expected Income (before horizon)</span>
              <span className="font-bold tabular-nums">
                +{currencySymbol}{Number(data?.expected_income || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-rose-400">
              <span>(-) Upcoming Bills & Liabilities</span>
              <span className="font-bold tabular-nums">
                -{currencySymbol}{Number(data?.upcoming_bills || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-[#C57CF9]">
              <span>(-) Goal Contributions (Apportioned)</span>
              <span className="font-bold tabular-nums">
                -{currencySymbol}{Number(data?.goal_allocations || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex items-center justify-between text-amber-400">
              <span>(-) Protected Emergency Reserve</span>
              <span className="font-bold tabular-nums">
                -{currencySymbol}{Number(data?.emergency_reserve || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="h-[1px] bg-white/10 my-1" />

            <div className="flex items-center justify-between text-[0.95rem] font-black">
              <span className="text-white">(=) Flexible Cash</span>
              <span className="text-[#34d399] tabular-nums">
                {currencySymbol}{Number(data?.flexible_cash || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Spending Pace vs Safe Limit */}
        <div className="glass-card p-6 rounded-[18px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-rounded text-[20px] text-[#C57CF9]">speed</span>
                <h2 className="text-[1.05rem] font-bold text-white tracking-tight">Spending Pace Analysis</h2>
              </div>
              <span className="text-[0.72rem] text-white/40 font-semibold">Real-Time Burn</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-[12px]">
                <span className="text-[0.68rem] text-white/40 font-bold uppercase block mb-1">Actual Daily Pace</span>
                <span className="text-[1.3rem] font-black text-white tabular-nums">
                  {currencySymbol}{Number(data?.current_daily_pace || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  <span className="text-[0.75rem] text-white/40 font-normal">/day</span>
                </span>
              </div>

              <div className="bg-white/[0.02] border border-white/[0.05] p-3.5 rounded-[12px]">
                <span className="text-[0.68rem] text-white/40 font-bold uppercase block mb-1">Safe Daily Limit</span>
                <span className="text-[1.3rem] font-black text-[#34d399] tabular-nums">
                  {currencySymbol}{Number(data?.safe_daily || 0).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  <span className="text-[0.75rem] text-white/40 font-normal">/day</span>
                </span>
              </div>
            </div>

            {/* Emergency Reserve Settings Form */}
            <form onSubmit={handleSaveReserve} className="p-4 bg-white/[0.02] border border-white/[0.05] rounded-[14px] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[0.75rem] font-bold text-white/80">Configure Emergency Reserve</span>
                <span className="text-[0.7rem] text-white/40 font-medium">Protected from Safe-to-Spend</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="100"
                  value={reserveInput}
                  onChange={(e) => setReserveInput(e.target.value)}
                  placeholder="10,000.00"
                  className="flex-1 px-3 py-2 rounded-[8px] bg-white/[0.04] border border-white/10 text-white text-[0.85rem] font-bold focus:outline-none focus:border-[#3869D2]"
                />
                <button
                  type="submit"
                  disabled={isUpdatingReserve}
                  className="px-4 py-2 rounded-[8px] bg-white/[0.08] hover:bg-white/[0.12] text-white text-[0.78rem] font-bold transition-all disabled:opacity-50"
                >
                  {isUpdatingReserve ? 'Saving...' : 'Update Reserve'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Row 3: Day-by-Day Cash Balance Forecast Timeline */}
      <div className="glass-card p-6 rounded-[18px]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-rounded text-[20px] text-[#34d399]">timeline</span>
              <h2 className="text-[1.1rem] font-bold text-white tracking-tight">
                Cash Balance Forecast Trajectory ({forecastDays} Days)
              </h2>
            </div>
            <p className="text-[0.75rem] text-white/40 mt-0.5">
              Simulated forward liquid balances factoring in payday injections, bill deductions, and daily burn
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-white/[0.06] rounded-[10px]">
            {[15, 30, 60].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setForecastDays(d)}
                className={`px-2.5 py-1 rounded-[6px] text-[0.72rem] font-bold transition-all ${
                  forecastDays === d ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Event Stream Table */}
        <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {timeline.map((point, i) => (
            <div
              key={point.date}
              className={`p-2.5 rounded-[10px] border flex items-center justify-between text-[0.78rem] transition-all ${
                point.is_negative
                  ? 'border-red-500/30 bg-red-500/[0.04]'
                  : point.is_below_reserve
                  ? 'border-amber-500/30 bg-amber-500/[0.04]'
                  : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.04]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-white/70 min-w-[65px]">{point.day_label}</span>
                {point.event_type ? (
                  <span
                    className={`px-2 py-0.5 rounded-[5px] text-[0.68rem] font-bold uppercase tracking-wider ${
                      point.event_type === 'INCOME'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                    }`}
                  >
                    {point.event_description}
                  </span>
                ) : (
                  <span className="text-white/30 text-[0.72rem]">Daily pace allocation</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {point.is_below_reserve && (
                  <span className="text-amber-400 text-[0.7rem] font-semibold flex items-center gap-1">
                    <span className="material-symbols-rounded text-[14px]">warning</span>
                    <span>Below Reserve</span>
                  </span>
                )}
                <span className="font-extrabold text-white tabular-nums">
                  {currencySymbol}{Number(point.projected_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
