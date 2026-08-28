'use client';

import React from 'react';
import { useFinancialHealthStore } from '@/stores/financial-health-store';
import { useAuthStore } from '@/stores/auth-store';

export const SpendingIntelligenceCard: React.FC = () => {
  const { spending } = useFinancialHealthStore();
  const { user } = useAuthStore();

  const currencySymbol = user?.currency === 'PHP' ? '₱' : '$';

  const categories = spending?.categories || [];
  const disc = spending?.discretionary;
  const vel = spending?.velocity;
  const sigChanges = spending?.significant_changes || [];

  return (
    <section className="glass-card p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-rounded text-[20px] text-[#C57CF9]">pie_chart</span>
            <h2 className="text-[1.05rem] font-bold tracking-tight text-white/90">
              Spending Intelligence & Velocity
            </h2>
          </div>
          <span className="text-[0.72rem] text-white/40 font-semibold">
            {currencySymbol}
            {Number(spending?.total_expenses || 0).toLocaleString('en-US', {
              minimumFractionDigits: 2
            })}{' '}
            Total
          </span>
        </div>

        {/* Velocity Stats Grid */}
        {vel && (
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-[10px]">
              <span className="text-[0.65rem] text-white/40 font-bold uppercase tracking-wider block mb-0.5">
                Daily Burn
              </span>
              <span className="text-[1.05rem] font-black text-white tabular-nums">
                {currencySymbol}
                {Number(vel.calendar_day_average).toLocaleString('en-US', {
                  minimumFractionDigits: 0
                })}
                <span className="text-[0.68rem] text-white/40 font-normal">/day</span>
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-[10px]">
              <span className="text-[0.65rem] text-white/40 font-bold uppercase tracking-wider block mb-0.5">
                Weekly Rate
              </span>
              <span className="text-[1.05rem] font-black text-white tabular-nums">
                {currencySymbol}
                {Number(vel.weekly_average).toLocaleString('en-US', {
                  minimumFractionDigits: 0
                })}
                <span className="text-[0.68rem] text-white/40 font-normal">/wk</span>
              </span>
            </div>

            <div className="bg-white/[0.02] border border-white/[0.04] p-3 rounded-[10px]">
              <span className="text-[0.65rem] text-white/40 font-bold uppercase tracking-wider block mb-0.5">
                Active Days
              </span>
              <span className="text-[1.05rem] font-black text-[#5a8aee] tabular-nums">
                {vel.active_days_count}
                <span className="text-[0.68rem] text-white/40 font-normal">
                  /{vel.total_days_count}d
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Discretionary vs Essential Gauge */}
        {disc && Number(disc.total_expenses) > 0 && (
          <div className="bg-white/[0.02] border border-white/[0.06] p-4 rounded-[12px] mb-5">
            <div className="flex items-center justify-between text-[0.75rem] font-bold mb-2">
              <span className="text-white/80">Classification Split</span>
              <div className="flex items-center gap-3 text-[0.72rem]">
                <span className="text-[#34d399]">
                  Essentials: {disc.essential_ratio_pct.toFixed(1)}%
                </span>
                <span className="text-[#C57CF9]">
                  Discretionary: {disc.discretionary_ratio_pct.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Split Progress Bar */}
            <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${disc.essential_ratio_pct}%` }}
                className="bg-[#34d399] h-full transition-all duration-700 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
              />
              <div
                style={{ width: `${disc.discretionary_ratio_pct}%` }}
                className="bg-[#C57CF9] h-full transition-all duration-700 shadow-[0_0_6px_rgba(197,124,249,0.4)]"
              />
            </div>
          </div>
        )}

        {/* Significant Shifts Callout (if any) */}
        {sigChanges.length > 0 && (
          <div className="mb-5 space-y-2">
            <span className="text-[0.72rem] font-bold text-amber-400 uppercase tracking-wider block">
              Notable Category Shifts
            </span>
            {sigChanges.slice(0, 2).map((sig, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-[0.78rem] bg-amber-500/[0.06] border border-amber-500/20 p-2.5 rounded-[8px]"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-rounded text-[16px] text-amber-400">
                    {sig.direction === 'UP' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                  <span className="font-semibold text-white/90">{sig.category_name}</span>
                </div>
                <span className="font-bold text-amber-300 tabular-nums">
                  {sig.direction === 'UP' ? '+' : ''}
                  {sig.percentage_change?.toFixed(1)}% ({currencySymbol}
                  {Number(sig.absolute_change).toLocaleString('en-US', {
                    minimumFractionDigits: 0
                  })}
                  )
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Top Categories Breakdown */}
        <div>
          <span className="text-[0.72rem] font-bold text-white/40 uppercase tracking-wider block mb-3">
            Top Categories
          </span>

          {categories.length === 0 ? (
            <div className="py-6 text-center text-white/30 text-[0.82rem]">
              No category expense activity recorded for this period.
            </div>
          ) : (
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {categories.slice(0, 5).map((cat, idx) => (
                <div key={cat.category_id || idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[0.8rem]">
                    <div className="flex items-center gap-2 font-medium text-white/90">
                      <div
                        className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: `${cat.color_hex}26`,
                          color: cat.color_hex
                        }}
                      >
                        <span className="material-symbols-rounded text-[13px]">{cat.icon}</span>
                      </div>
                      <span>{cat.category_name}</span>
                    </div>

                    <div className="flex items-center gap-2 font-bold tabular-nums">
                      <span className="text-white">
                        {currencySymbol}
                        {Number(cat.current_amount).toLocaleString('en-US', {
                          minimumFractionDigits: 2
                        })}
                      </span>
                      <span className="text-white/40 text-[0.72rem] min-w-[34px] text-right">
                        {cat.percentage_of_total.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      style={{
                        width: `${Math.min(cat.percentage_of_total, 100)}%`,
                        backgroundColor: cat.color_hex
                      }}
                      className="h-full rounded-full transition-all duration-600 shadow-[0_0_6px_rgba(56,105,210,0.3)]"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SpendingIntelligenceCard;
