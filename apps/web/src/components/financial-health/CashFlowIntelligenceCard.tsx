'use client';

import React from 'react';
import { useFinancialHealthStore } from '@/stores/financial-health-store';
import { useAuthStore } from '@/stores/auth-store';

export const CashFlowIntelligenceCard: React.FC = () => {
  const { cashFlow } = useFinancialHealthStore();
  const { user } = useAuthStore();

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const stability = cashFlow?.stability;
  const incTrend = cashFlow?.income_trend;
  const expTrend = cashFlow?.expense_trend;
  const weeks = cashFlow?.weekly_breakdown || [];

  const getStabilityBadge = (cls?: string) => {
    switch (cls) {
      case 'VERY_STABLE':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'STABLE':
        return 'text-[#d9a4ff] bg-[#C57CF9]/10 border-[#C57CF9]/30';
      case 'VARIABLE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'UNSTABLE':
      case 'HIGHLY_UNSTABLE':
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  // Find max weekly expense or income for bar chart height scaling
  const maxWeekly = weeks.reduce((acc, w) => {
    return Math.max(acc, Number(w.income), Number(w.expenses));
  }, 1000);

  return (
    <section className="glass-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px] text-[#3869D2]">swap_vert</span>
            <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
              Cash Flow Engine & Stability
            </h2>
          </div>

          {stability && (
            <div className="flex items-center gap-2">
              <span className="text-[0.72rem] text-white/40 font-medium">Stability:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[0.7rem] font-bold border uppercase tracking-wider ${getStabilityBadge(
                  stability.classification
                )}`}
              >
                {stability.classification.replace('_', ' ')} ({stability.score}/100)
              </span>
            </div>
          )}
        </div>

        {/* Period Trend Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {/* Income Trend Box */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-[12px] p-3.5">
            <div className="flex items-center justify-between text-[0.75rem] mb-1">
              <span className="text-white/40 font-semibold uppercase tracking-wider">
                Income Trend
              </span>
              <span
                className={`flex items-center gap-0.5 font-bold ${
                  incTrend?.direction === 'UP'
                    ? 'text-emerald-400'
                    : incTrend?.direction === 'DOWN'
                    ? 'text-red-400'
                    : 'text-white/40'
                }`}
              >
                <span className="material-symbols-rounded text-[14px]">
                  {incTrend?.direction === 'UP'
                    ? 'trending_up'
                    : incTrend?.direction === 'DOWN'
                    ? 'trending_down'
                    : 'trending_flat'}
                </span>
                {incTrend?.percentage_change !== null && incTrend?.percentage_change !== undefined
                  ? `${Math.abs(incTrend.percentage_change).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[1.2rem] font-extrabold text-white tabular-nums">
                {currencySymbol}
                {Number(cashFlow?.current_income || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2
                })}
              </span>
              <span className="text-[0.72rem] text-white/40 tabular-nums">
                vs {currencySymbol}
                {Number(incTrend?.previous || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 0
                })}
              </span>
            </div>
          </div>

          {/* Expense Trend Box */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-[12px] p-3.5">
            <div className="flex items-center justify-between text-[0.75rem] mb-1">
              <span className="text-white/40 font-semibold uppercase tracking-wider">
                Expense Trend
              </span>
              <span
                className={`flex items-center gap-0.5 font-bold ${
                  expTrend?.direction === 'DOWN'
                    ? 'text-emerald-400'
                    : expTrend?.direction === 'UP'
                    ? 'text-amber-400'
                    : 'text-white/40'
                }`}
              >
                <span className="material-symbols-rounded text-[14px]">
                  {expTrend?.direction === 'UP'
                    ? 'trending_up'
                    : expTrend?.direction === 'DOWN'
                    ? 'trending_down'
                    : 'trending_flat'}
                </span>
                {expTrend?.percentage_change !== null && expTrend?.percentage_change !== undefined
                  ? `${Math.abs(expTrend.percentage_change).toFixed(1)}%`
                  : '0%'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[1.2rem] font-extrabold text-white tabular-nums">
                {currencySymbol}
                {Number(cashFlow?.current_expenses || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 2
                })}
              </span>
              <span className="text-[0.72rem] text-white/40 tabular-nums">
                vs {currencySymbol}
                {Number(expTrend?.previous || 0).toLocaleString('en-US', {
                  minimumFractionDigits: 0
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Cash Flow Breakdown Bars */}
        <div>
          <div className="flex items-center justify-between text-[0.75rem] font-bold text-white/50 mb-3">
            <span>Weekly Cash Flow Distribution</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#C57CF9]" /> Income
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3869D2]" /> Expense
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {weeks.map((w) => {
              const inc = Number(w.income);
              const exp = Number(w.expenses);
              const net = Number(w.net_flow);

              const incPct = maxWeekly > 0 ? (inc / maxWeekly) * 100 : 0;
              const expPct = maxWeekly > 0 ? (exp / maxWeekly) * 100 : 0;

              return (
                <div
                  key={w.week_number}
                  className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-[10px] space-y-2"
                >
                  <div className="flex items-center justify-between text-[0.78rem]">
                    <span className="font-semibold text-white/80">{w.label}</span>
                    <span
                      className={`font-bold tabular-nums ${
                        net >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {net >= 0 ? '+' : ''}
                      {currencySymbol}
                      {net.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Dual Bar (Income & Expense) */}
                  <div className="space-y-1">
                    {inc > 0 && (
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(incPct, 100)}%` }}
                          className="h-full bg-[#C57CF9] rounded-full transition-all duration-500"
                        />
                      </div>
                    )}
                    {exp > 0 && (
                      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(expPct, 100)}%` }}
                          className="h-full bg-[#3869D2] rounded-full transition-all duration-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CashFlowIntelligenceCard;
